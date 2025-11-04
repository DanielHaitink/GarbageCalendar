import type {Address} from "../types.ts";

export const cacheK(address: Address) {
        return `${address.postcode.toUpperCase()}${address.number}${address.suffix?.toUpperCase() || ''}`;
    }

class GarbageCache {
    constructor() {
    }

    export static getKey(address: Address) {
        return `${address.postcode.toUpperCase()}${address.number}${address.suffix?.toUpperCase() || ''}`;
    }
}

const cache = new GarbageCache();