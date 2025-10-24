import fetch from 'node-fetch';

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

    constructor(providerName) {
        const provider = GarbageProvider.PROVIDERS[providerName];

        if (!provider)
            throw new Error(`Unknown provider: ${providerName}`);

        this.providerUrl = `${GarbageProvider.BASE_URL}/organisations/${provider}/address`;
    }

    isAuthenticated() {
        return this.authToken !== null && this.authValidUntil > new Date();
    }

    async #authenticate() {
        if (this.isAuthenticated())
            return true;

        const result = await fetch(
            `${GarbageProvider.AUTH_URL}?key=${GarbageProvider.API_KEY}`,
            {method: 'POST'}
        );

        if (!result.ok)
            throw new Error(`Failed to authenticate: ${result.statusText}`);

        const jsonResult = await result.json();

        this.authToken = jsonResult.idToken;
        this.authValidUntil = new Date();
        this.authValidUntil.setSeconds(this.authValidUntil.getSeconds() + Number.parseInt(jsonResult.expiresIn));

        return true;
    }

    async getAddressId(postalCode, houseNumber, suffix = '') {
        if (!await this.#authenticate())
            throw new Error('Failed to authenticate');

        const url = `${this.providerUrl}?zipcode=${postalCode}&housenumber=${houseNumber}`;
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
            if (address.addition.toLowerCase() === suffix.toLowerCase())
                return address.addressId.toLowerCase();
        }

        throw new Error('No matching address found');
    }

    async getWasteData(addressId) {
        try {
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

            const data = await result.json();

            // https://europe-west3-burgerportaal-production.cloudfunctions.net/exposed/organisations/452048812597326549/address/238127830304985004/calendar

            return data;
        } catch (e) {
            console.error(e);
            throw new Error('Failed to get waste data');
        }
    }
}