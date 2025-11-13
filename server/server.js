import * as fs from "node:fs/promises";
import express from "express";
import rateLimit from "express-rate-limit";
import https from "https";
import handler from "./api/proxy.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

class SslCertificate {
    constructor(key, cert) {
        this.key = key;
        this.cert = cert;
    }

    static async loadFile(file) {
        try {
            return await fs.readFile(file);
        } catch (e) {
            console.error(e);
        }

        return null;
    }

    static async load(keyFile, certFile) {
        const key = await this.loadFile(keyFile);
        const cert = await this.loadFile(certFile);

        if (!key || !cert)
            throw new Error('Failed to load SSL certificate');

        return new SslCertificate(key, cert);
    }
}

class Server {
    static DEFAULT_PORT = 3000;

    app = null;
    sslCertificate = null;
    port = 0;
    https = null;
    proxy = handler;
    limiter = rateLimit({
        windowMs: 5 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
    });
    logfile = process.env.LOGFILE || './access.log';

    constructor(port = Server.DEFAULT_PORT, sslCertificate = null) {
        if (!sslCertificate)
            console.log("⚠️ No SSL certificate provided, running as http server");
        else
            console.log("SSL certificate provided, running as https server");

        this.app = express();
        this.port = port;
        this.sslCertificate = sslCertificate;

        this.#setup();
    }

    #logRequest(req, res, next) {
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const referer = req.get('Referer') || 'None';
        const origin = req.get('Origin') || 'None';

        console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - Origin: ${origin} - Referer: ${referer} - UA: ${userAgent}`);

        fs.appendFile(
            this.logfile,
            `${timestamp} | ${req.method} | ${req.url} | ${ip} | ${origin} | ${referer} | ${userAgent}\n`).catch(console.error);

        next();
    }

    #setup() {
        if (this.sslCertificate) {
            this.https = https.createServer({
                key: this.sslCertificate.key, cert: this.sslCertificate.cert
            }, this.app);
        }

        this.app.set('trust proxy', process.env.TRUST_PROXY || true);
        this.app.use(this.#logRequest.bind(this));
        this.app.use(cors(
            {
                origin: (origin, callback) => {
                    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ["*"];

                    if ((!origin && process.env.NODE_ENV !== 'production') ||
                        allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                        callback(null, true);
                    } else {
                        console.log(`❌ Blocked request from unauthorized origin: ${origin}`);
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true,
                methods: ['GET','OPTIONS'],
                allowedHeaders: ['Content-Type', 'X-Requested-With']
            }
        ));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(this.limiter);

        this.app.get('/health', (req, res) => {
            res.json({status: 'ok', timestamp: new Date().toISOString()});
        });

        this.app.get('/api/proxy', (req, res) => {
            this.proxy(req, res);
        });

        this.app.use((req, res) => {
            console.log(`❌ 404 - ${req.method} ${req.originalUrl} from ${req.ip}`);
            res.status(404).json({error: 'Endpoint not found'});
        });

    }

    start() {
        if (this.https) {
            this.https.listen(this.port, "0.0.0.0", () => {
                console.log(`Server WITH SSL started on port ${this.port}`);
            });
        } else {
            this.app.listen(this.port, "0.0.0.0", () => {
                console.log(`Server started on port ${this.port}`);
            });
        }
    }
}

const server = new Server(process.env.PORT || 3000);
server.start();