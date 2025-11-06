import fetch from 'node-fetch';
import {GarbageCache} from "./garbageCache.js";

export class GarbageProvider {
    static PROVIDER_GRONINGEN = 'Groningen';

    static API_KEY = 'AIzaSyA6NkRqJypTfP-cjWzrZNFJzPUbBaGjOdk';
    static PROVIDERS = {
        'Groningen': '452048812597326549'
    };
    static AUTH_URL = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser";
    static BASE_URL = 'https://europe-west3-burgerportaal-production.cloudfunctions.net/exposed';

    providerUrl = null;
    authToken = null;
    authValidUntil = null;
    IDCache = new GarbageCache(1000 * 60 * 60 * 24 * 31);
    cache = new GarbageCache();

    /**
     *
     * @param providerName {string} The name of the provider, available in PROVIDERS.
     */
    constructor(providerName) {
        const provider = GarbageProvider.PROVIDERS[providerName];

        if (!provider)
            throw new Error(`Unknown provider: ${providerName}`);

        this.providerUrl = `${GarbageProvider.BASE_URL}/organisations/${provider}/address`;
    }

    /**
     * Check if the provider has a valid authentication.
     * @returns {boolean} True if it is currently authenticated, false otherwise.
     */
    isAuthenticated() {
        return this.authToken !== null && this.authValidUntil > new Date();
    }

    /**
     * Authenticate with the server. If it already has a authentication stored, it will not authenticate again.
     * @returns {Promise<>}
     */
    async #authenticate() {
        if (this.isAuthenticated())
             return true;

        const result = await fetch(
            `${GarbageProvider.AUTH_URL}?key=${GarbageProvider.API_KEY}`,
            {method: 'POST'}
        );

        if (!result.ok) {
            console.error(`Failed to authenticate: ${result.statusCode} ${result.statusText}`);
            return false;
        }

        const jsonResult = await result.json();

        this.authToken = jsonResult.idToken;
        this.authValidUntil = new Date();
        this.authValidUntil.setSeconds(this.authValidUntil.getSeconds() + Number.parseInt(jsonResult.expiresIn));

        return true;
    }

    /**
     *
     * @param postalCode {string}
     * @param houseNumber {string}
     * @param suffix {string}
     * @returns {string}
     */
    #getAddressKey(postalCode, houseNumber, suffix = '') {
        return `${postalCode.trim().toUpperCase()}${houseNumber.trim()}${suffix?.trim().toUpperCase() || ''}`;
    }

    /**
     * Obtain the address information of the server for the given address.
     * The function will throw an error if no address information can be obtained.
     * @param postalCode {string} The postal code
     * @param houseNumber {string} The number as string
     * @param suffix {string} The suffix, if applicable.
     * @returns {Promise<{}>} The address object.
     */
    async getAddress(postalCode, houseNumber, suffix = '') {
        const addressKey = this.#getAddressKey(postalCode, houseNumber, suffix);

        if (this.IDCache.has(addressKey))
            return JSON.parse(this.IDCache.get(addressKey));

        if (!await this.#authenticate())
            throw new Error('Failed to authenticate');

        const params = new URLSearchParams(
            {
                zipcode: postalCode.toUpperCase(),
                housenumber: houseNumber,
                suffix: suffix?.toUpperCase() || ''
            }
        );

        const url = `${this.providerUrl}?${params.toString()}`;

        console.log(url);
        const response = await fetch(
            url,
            {method: 'GET', headers: {authorization: this.authToken}}
        );

        if (!response.ok)
            throw new Error(`Failed to get addressId: ${response.statusText}`);

        const addresses = await response.json();

        if (!addresses || addresses.length === 0)
            throw new Error('No addresses found');

        for (const address of addresses) {
            if (address.addition.toLowerCase() === suffix.toLowerCase()) {
                this.IDCache.add(addressKey, JSON.stringify(address))

                return address;
            }
        }

        throw new Error('No matching address found');
    }

    /**
     * Obtain the waste data from the given address ID.
     * This function will throw an error if no waste data can be obtained.
     * @param addressId {string} The address ID.
     * @returns {Promise<{}[]>} The waste data as an array of dictionaries.
     */
    async getWasteData(addressId) {
        try {
            if (this.cache.has(addressId))
                return this.cache.get(addressId);

            if (!await this.#authenticate())
                throw new Error('Failed to authenticate');

            const result = await fetch(
                `${this.providerUrl}/${addressId}/calendar`,
                {method: 'GET', headers: {authorization: this.authToken}}
            );

            if (!result.ok)
                throw new Error(`Failed to get waste data: ${result.statusText}`);

            if (result.status === 204)
                return [];

            const data = await result.json()

            console.log(data);

            this.cache.add(addressId, data);

            return data;
        } catch (e) {
            console.error(e);
            throw new Error(e.message || "Er is iets misgegaan");
        }
    }
}