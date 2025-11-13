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
    static BASE_URL = "https://grapi.hait.ink/api/proxy"; //env.isDevelopment ? "http://localhost:3000/api/proxy" :

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
//         const response = await fetch('/assets/test_data.json');
//         if (response.ok) {
//             const text = await response.text();
//             console.log(text);
//             const rawData: RawGarbageData = JSON.parse(`
//             {
//     "address": {
//         "addressId": "238127830304984910",
//         "addition": "",
//         "zipcode": "9751VN",
//         "street": "Houtweg",
//         "city": "Haren Gn",
//         "housenumber": 11,
//         "municipalityId": "0014",
//         "latitude": 53.16694755,
//         "longitude": 6.6208005
//     },
//     "pickups": [
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 3,
//             "collectionDate": "2025-01-03T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491003-01-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 10,
//             "collectionDate": "2025-01-10T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491010-01-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 13,
//             "collectionDate": "2025-01-13T00:00:00.000Z",
//             "fraction": "KERSTBOMEN",
//             "placementPeriod": "Zet de kerstboom vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491013-01-2025KERST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 15,
//             "collectionDate": "2025-01-15T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491015-01-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 17,
//             "collectionDate": "2025-01-17T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491017-01-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 24,
//             "collectionDate": "2025-01-24T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491024-01-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 27,
//             "collectionDate": "2025-01-27T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491027-01-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 1,
//             "day": 31,
//             "collectionDate": "2025-01-31T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491031-01-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 7,
//             "collectionDate": "2025-02-07T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491007-02-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 12,
//             "collectionDate": "2025-02-12T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491012-02-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 14,
//             "collectionDate": "2025-02-14T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491014-02-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 21,
//             "collectionDate": "2025-02-21T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491021-02-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 24,
//             "collectionDate": "2025-02-24T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491024-02-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 2,
//             "day": 28,
//             "collectionDate": "2025-02-28T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491028-02-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 7,
//             "collectionDate": "2025-03-07T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491007-03-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 12,
//             "collectionDate": "2025-03-12T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491012-03-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 14,
//             "collectionDate": "2025-03-14T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491014-03-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 21,
//             "collectionDate": "2025-03-21T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491021-03-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 24,
//             "collectionDate": "2025-03-24T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491024-03-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 3,
//             "day": 28,
//             "collectionDate": "2025-03-28T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491028-03-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 4,
//             "collectionDate": "2025-04-04T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491004-04-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 9,
//             "collectionDate": "2025-04-09T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491009-04-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 11,
//             "collectionDate": "2025-04-11T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491011-04-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 18,
//             "collectionDate": "2025-04-18T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491018-04-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 21,
//             "collectionDate": "2025-04-21T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491021-04-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 4,
//             "day": 25,
//             "collectionDate": "2025-04-25T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491025-04-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 2,
//             "collectionDate": "2025-05-02T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491002-05-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 7,
//             "collectionDate": "2025-05-07T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491007-05-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 9,
//             "collectionDate": "2025-05-09T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491009-05-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 16,
//             "collectionDate": "2025-05-16T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491016-05-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 19,
//             "collectionDate": "2025-05-19T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491019-05-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 23,
//             "collectionDate": "2025-05-23T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491023-05-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 5,
//             "day": 30,
//             "collectionDate": "2025-05-30T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491030-05-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 4,
//             "collectionDate": "2025-06-04T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491004-06-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 6,
//             "collectionDate": "2025-06-06T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491006-06-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 13,
//             "collectionDate": "2025-06-13T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491013-06-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 16,
//             "collectionDate": "2025-06-16T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491016-06-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 20,
//             "collectionDate": "2025-06-20T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491020-06-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 6,
//             "day": 27,
//             "collectionDate": "2025-06-27T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491027-06-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 2,
//             "collectionDate": "2025-07-02T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491002-07-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 4,
//             "collectionDate": "2025-07-04T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491004-07-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 11,
//             "collectionDate": "2025-07-11T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491011-07-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 14,
//             "collectionDate": "2025-07-14T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491014-07-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 18,
//             "collectionDate": "2025-07-18T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491018-07-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 7,
//             "day": 25,
//             "collectionDate": "2025-07-25T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491025-07-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 1,
//             "collectionDate": "2025-08-01T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491001-08-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 6,
//             "collectionDate": "2025-08-06T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491006-08-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 8,
//             "collectionDate": "2025-08-08T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491008-08-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 11,
//             "collectionDate": "2025-08-11T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491011-08-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 15,
//             "collectionDate": "2025-08-15T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491002-08-1525REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 22,
//             "collectionDate": "2025-08-22T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491022-08-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 8,
//             "day": 29,
//             "collectionDate": "2025-08-29T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491029-08-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 3,
//             "collectionDate": "2025-09-03T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491003-09-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 5,
//             "collectionDate": "2025-09-05T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491005-09-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 8,
//             "collectionDate": "2025-09-08T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491008-09-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 12,
//             "collectionDate": "2025-09-12T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491012-09-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 19,
//             "collectionDate": "2025-09-19T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491019-09-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 9,
//             "day": 26,
//             "collectionDate": "2025-09-26T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491026-09-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 1,
//             "collectionDate": "2025-10-01T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491001-10-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 3,
//             "collectionDate": "2025-10-03T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491003-10-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 6,
//             "collectionDate": "2025-10-06T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491006-10-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 10,
//             "collectionDate": "2025-10-10T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491010-10-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 17,
//             "collectionDate": "2025-10-17T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491017-10-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 24,
//             "collectionDate": "2025-10-24T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491024-10-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 10,
//             "day": 31,
//             "collectionDate": "2025-10-31T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491031-10-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 5,
//             "collectionDate": "2025-11-05T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491005-11-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 7,
//             "collectionDate": "2025-11-07T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491007-11-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 13,
//             "collectionDate": "2025-11-13T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491013-11-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 14,
//             "collectionDate": "2025-11-14T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491014-11-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 21,
//             "collectionDate": "2025-11-21T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491021-11-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 24,
//             "collectionDate": "2025-11-24T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491024-11-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 11,
//             "day": 28,
//             "collectionDate": "2025-11-28T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491028-11-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 5,
//             "collectionDate": "2025-12-05T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491005-12-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 11,
//             "collectionDate": "2025-12-11T00:00:00.000Z",
//             "fraction": "PAPIER",
//             "placementPeriod": "Zet het oud papier om 07.00 uur aan de straat. Melk- en sappakken horen niet bij het oud papier!",
//             "placementDescription": "",
//             "uuid": "23812783030498491011-12-2025PAPIER",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 12,
//             "collectionDate": "2025-12-12T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491012-12-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 19,
//             "collectionDate": "2025-12-19T00:00:00.000Z",
//             "fraction": "GFT",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491019-12-2025GFT",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 22,
//             "collectionDate": "2025-12-22T00:00:00.000Z",
//             "fraction": "KCA",
//             "placementPeriod": "Klein chemisch afval kunt u inleveren op de parkeerplaats van V.V. Haren aan de Onnerweg in Haren tussen 13.35 - 14.05 uur.",
//             "placementDescription": "",
//             "uuid": "23812783030498491022-12-2025KCA",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         },
//         {
//             "year": 2025,
//             "month": 12,
//             "day": 27,
//             "collectionDate": "2025-12-27T00:00:00.000Z",
//             "fraction": "REST",
//             "placementPeriod": "Zet de container vóór 7.00 uur aan de straat.",
//             "placementDescription": "",
//             "uuid": "23812783030498491027-12-2025REST",
//             "municipalityId": "0014",
//             "organisationId": "452048812597326549"
//         }
//     ],
//     "lastUpdated": "2025-11-11T11:26:19.000Z"
// }
//             `);

        //     return {
        //         address,
        //         rawAddress: rawData.address,
        //         pickups: this.formatGarbageData(rawData.pickups),
        //         lastUpdated: rawData.lastUpdated,
        //     }
        // }


        const data = this.getCached(address) || await this.fetchData(address);
        this.cacheData(data);

        return data;
    }
}

export const garbageApi = new GarbageApiService();