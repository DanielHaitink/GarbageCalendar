import {GarbageProvider} from "./garbageProvider.js";

const garbageProvider = new GarbageProvider(GarbageProvider.PROVIDER_GRONINGEN);

function getAddressInformation(request) {
    const {postcode, number, suffix = ''} = request.query;

    if (!postcode || !number)
        throw new Error('Missing postcode or number');

    if (postcode.length !== 6 || number.length < 1 || number.length > 4 ||
        !/^\d+$/.test(number) || !/\d{4}\w{2}$/.test(postcode))
        throw new Error('Invalid postcode or number');

    return {
            postcode,
            number,
            suffix
        }
}

function setCorsHeaders(result) {
    result.setHeader('Access-Control-Allow-Origin', '*');
    result.setHeader('Access-Control-Allow-Methods', 'GET');
    result.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    result.setHeader('Access-Control-Max-Age', '3600');
}

function sendResponse(result, data) {
    setCorsHeaders(result);
    return result.json(data);
}

function sendError(result, errorNumber, errorText = "") {
    setCorsHeaders(result);
    return result.status(errorNumber).json({ error: errorText });
}

export default async function handler(req, res) {
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return sendResponse(res, {});
    }

    try {
        const {postcode, number, suffix = ''} = req.query;

        if (!postcode || !number)
            return sendError(res, 400, 'Missing postcode or number');

        const id = await garbageProvider.getAddressId(postcode, number, suffix);

        if (!id)
            return sendError(res, 404, 'Address not found');

        const data = await garbageProvider.getWasteData(id);

        return sendResponse(res, data);
    } catch (e) {
        console.error(e);
        return sendError(res, 500, "Internal server error")
    }
}