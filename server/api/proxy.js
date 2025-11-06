import {GarbageProvider} from "./garbageProvider.js";

const garbageProvider = new GarbageProvider(GarbageProvider.PROVIDER_GRONINGEN);

/**
 * Get the address information from the request.
 * @param request {XMLHttpRequest}
 * @returns {{postcode: string, number: string, suffix: string}}
 */
function getAddressInformation(request) {
    const {postcode, number, suffix = ''} = request.query;

    if (!postcode || !number)
        throw new Error('Missing postcode or number');

    if (postcode.length !== 6 || number.length < 1 || number.length > 4 ||
        !/^\d+$/.test(number) || !/\d{4}\w{2}$/.test(postcode))
        throw new Error('Invalid postcode or number');

    return {
            postcode: postcode.trim().toUpperCase(),
            number: number.trim(),
            suffix: suffix.trim().toUpperCase() || ''
        }
}

/**
 * Set CORS headers to the result
 * @param result {} The result
 */
function setCorsHeaders(result) {
    result.setHeader('Access-Control-Allow-Origin', '*');
    result.setHeader('Access-Control-Allow-Methods', 'GET');
    result.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    result.setHeader('Access-Control-Max-Age', '3600');
}

/**
 * Send a response.
 * @param result {} The result.
 * @param data {{}} The data to send.
 * @returns {*}
 */
function sendResponse(result, data) {
    setCorsHeaders(result);
    result.setHeader('Content-Type', 'application/json');
    return result.json(data);
}

/**
 * Send an error response.
 * @param result {} The result
 * @param errorNumber {string || number} The error number
 * @param errorText {string} The error message.
 * @returns {*}
 */
function sendError(result, errorNumber, errorText = "") {
    setCorsHeaders(result);
    result.status(errorNumber);
    result.setHeader('Content-Type', 'text/plain; charset=utf-8');
    result.setHeader('Content-Length', errorText.length);
    return result.end(errorText);
}

/**
 * The request handler.
 * @param req {} The request
 * @param res {} The result.
 * @returns {Promise<*>}
 */
export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return sendResponse(res, {});
    }

    try {
        const {postcode, number, suffix = ''} = getAddressInformation(req);

        if (!postcode || !number)
            return sendError(res, 400, 'Missing postcode or number');

        const address = await garbageProvider.getAddress(postcode, number, suffix);

        if (!address || !address.addressId)
            return sendError(res, 404, 'Address not found');

        const data = await garbageProvider.getWasteData(address.addressId);

        return sendResponse(res, {address: address, pickups: data, lastUpdated: new Date().toISOString()});
    } catch (e) {
        console.error(e);
        return sendError(res, 500, e.message || "Er is iets misgegaan");
    }
}