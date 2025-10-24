import {type Address, type GarbageData, type GarbagePickup, type GarbageType, GarbageTypes} from "../types.ts";


export interface RawGarbageData {
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
    static BASE_URL = "http://localhost:3000/api/proxy"
    static CACHE_VALIDITY = 1000 * 60 * 60 * 24 * 90;

    private cacheKey(address: Address) : string {
        return `${address.postcode}${address.number}${address.suffix || ''}`;
    }

    private getCached(address: Address) : GarbageData | null {
        const cacheKey = this.cacheKey(address);
        const cache = localStorage.getItem(cacheKey);

        if (!cache)
            return null;

        const data: GarbageData = JSON.parse(cache, (key, value) => {
            if (key === 'date')
                return new Date(value);
            // if (key === 'pickups' && Array.isArray(value) && value.length > 0)
            //     return value.map((p: GarbagePickup) => ({
            //         ...p,
            //         date: new Date(p.date),
            //         dateString: p.dateString,
            //         placement: p.placement,
            //         description: p.description,
            //         id: p.id,
            //         type: this.normalizeType(p.type)
            //     }));
            return value;
        });

        if (new Date(data.lastUpdated).getTime() - new Date().getTime() >= GarbageApiService.CACHE_VALIDITY)
            return null;

        console.log("Obtaining data from cache: ", data.address.postcode, data.address.number, data.address.suffix || "")
        return data;
    }

    private cacheData(data: GarbageData) {
        const cacheKey = this.cacheKey(data.address);
        const jsonData = JSON.stringify(data)
        localStorage.setItem(cacheKey, jsonData);
    }

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

    private formatGarbageData(data: RawGarbageData[]): GarbagePickup[] {
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

    private async fetchData(address: Address) : Promise<GarbageData> {
        try {
            const params = new URLSearchParams({
                postcode: address.postcode,
                number: address.number,
                suffix: address.suffix || ''
            });

            const response = await fetch(`${GarbageApiService.BASE_URL}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok)
                throw new Error(`Failed to fetch data: ${response.statusText}`);

            const data = await response.json();

            if (!data || !Array.isArray(data))
                throw new Error('Invalid data');

            return {
                address,
                pickups: this.formatGarbageData(data),
                lastUpdated: new Date().toISOString()
            }
        } catch (e) {
            console.error(e);
            throw new Error('Failed to fetch data');
        }
    }

    async getGarbageData(address: Address) : Promise<GarbageData> {
        const data = this.getCached(address) || await this.fetchData(address);
        this.cacheData(data);

        return data;
    }
}

export const garbageApi = new GarbageApiService();