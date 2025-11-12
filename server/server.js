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
        windowMs: 5 * 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false,
    });

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

    #setup() {
        if (this.sslCertificate) {
            this.https = https.createServer({
                key: this.sslCertificate.key,
                cert: this.sslCertificate.cert
            }, this.app);
        }

        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(this.limiter);

        this.app.get('/api/proxy', (req, res) => {
            this.proxy(req, res);
        });
    }

    start() {
        if (this.https) {
            this.https.listen(this.port, () => {
                console.log(`Server WITH SSL started on port ${this.port}`);
            });
        } else {
            this.app.listen(this.port, () => {
                console.log(`Server started on port ${this.port}`);
            });
        }
    }
}

const server = new Server(process.env.PORT || 3000); //await SslCertificate.load("./test.key", "./test.crt"
server.start();