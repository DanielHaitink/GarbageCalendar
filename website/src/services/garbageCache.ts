import type {Address} from "../types.ts";

export const getCacheKey = (address: Address) => {
        return `${address.postcode.toUpperCase()}${address.number}${address.suffix?.toUpperCase() || ''}`;
    }

class GarbageCache {
    static RECENT_SEARCHES_KEY = "recentSearches";

    recentSearches: Address[] = [];

    constructor() {
        this.recentSearches = JSON.parse(localStorage.getItem(GarbageCache.RECENT_SEARCHES_KEY) || "[]");
    }

    addRecentSearch(address: Address) {
        if (this.recentSearches.length > 5)
            this.recentSearches.pop();

        this.recentSearches.unshift(address);
        localStorage.setItem(GarbageCache.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    }

    getRecentSearches() {
        return this.recentSearches;
    }

    storeCached(address: Address, data: any) {
        localStorage.setItem(getCacheKey(address), JSON.stringify(data));
    }

    getCached(address: Address) {
        const data = localStorage.getItem(getCacheKey(address));

        if (data) {
            JSON.parse(data, (key, value) => {
                if (key === 'date')
                    return new Date(value);
                return value;
            });

            if (new Date(data.lastUpdated).getTime() - new Date().getTime() >= GarbageApiService.CACHE_VALIDITY)
                return null;
        } else {
            return undefined;
        }
    }

    clearCache() {

    }

    cleanCache() {

    }
}

const cache = new GarbageCache();