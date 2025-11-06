import {type Address, type GarbageData, type GarbagePickup, type GarbageType, GarbageTypes} from "../types.ts";
import {cache} from "./garbageCache.ts";
import {env} from "../utils/env.ts";

export interface RawGarbageData {
    address: RawGarbageAddress;
    pickups: RawGarbagePickup[];
    lastUpdated: string;
}

export interface RawGarbageAddress {
    addressId: string;
    addition: string;
    zipcode: string;
    street: string;
    city: string;
    housenumber: number;
    municipalityId: string;
    latitude: number;
    longitude: number;
}

export interface RawGarbagePickup {
    year: number;
    month: number;
    day: number;
    collectionDate: string;
    fraction: string;
    placementPeriod: string;
    placementDescription: string;
    uuid: string;
    municipalityId: string,
    organisationId: string;
}

class GarbageApiService {
    static BASE_URL = env.isDevelopment ? "http://localhost:3000/api/proxy" : "https://garbage.lionsdensoftware.nl";

    static DEV = import.meta.env.DEV;
    /**
     * Get the cached garbage data or null if not available.
     * @param address {Address} The address.
     * @private
     */
    private getCached(address: Address) : GarbageData | null {
        return cache.getCached(address);
    }

    /**
     * Cache the garbage data.
     * @param data {GarbageData} The garbage data to cache.
     * @private
     */
    private cacheData(data: GarbageData) {
        cache.storeCached(data.address, data);
        cache.addRecentSearch(data.address);
    }

    /**
     * Normalize the type name.
     * @param type {string} The type
     * @private
     */
    private normalizeType(type: string): GarbageType {
        switch (type.toLowerCase()) {
            case 'restafval':
            case 'rest':
                return GarbageTypes.RESTAFVAL;
            case 'papier':
            case 'pmc':
                return GarbageTypes.PAPIER;
            case 'gft':
                return GarbageTypes.GFT;
            case 'kca':
                return GarbageTypes.KCA;
            case 'kerstbomen':
            case 'kerst':
                return GarbageTypes.KERSTBOMEN;
            case 'glas':
                return GarbageTypes.GLAS;
            case 'plastic':
                return GarbageTypes.PLASTIC;
            default:
                console.error(`Unknown type: ${type}`);
        }

        return GarbageTypes.ANDERS;
    }

    /**
     * Format garbage data.
     * @param data {RawGarbageData} The raw garbage data from the api
     * @private
     */
    private formatGarbageData(data: RawGarbagePickup[]): GarbagePickup[] {
        const result = [];

        for (const item of data) {
            result.push({
                id: item.uuid,
                type: this.normalizeType(item.fraction),
                date: new Date(item.collectionDate),
                dateString: item.collectionDate,
                placement: item.placementPeriod,
                description: item.placementDescription
            })
        }

        return result;
    }

    /**
     * Fetch data from the server
     * @param address
     * @private
     */
    private async fetchData(address: Address) : Promise<GarbageData> {
        try {
            const params = new URLSearchParams({
                postcode: address.postcode.toUpperCase(),
                number: address.number.toFixed(0),
                suffix: address.suffix?.toUpperCase() || ''
            });

            const response = await fetch(`${GarbageApiService.BASE_URL}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log(response);

            if (!response.ok) {
                const message = await response.text() || response.statusText;
                throw new Error(`Failed to fetch data: ${message}`);
            }

            const data: RawGarbageData = await response.json();

            console.log(data);

            if (!data || !Array.isArray(data.pickups))
                throw new Error('Invalid data');

            return {
                address,
                rawAddress: data.address,
                pickups: this.formatGarbageData(data.pickups),
                lastUpdated: data.lastUpdated,
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Get the garbage data from the address.
     * @param address {Address} The address
     */
    async getGarbageData(address: Address) : Promise<GarbageData> {
        const data = this.getCached(address) || await this.fetchData(address);
        this.cacheData(data);

        return data;
    }
}

export const garbageApi = new GarbageApiService();