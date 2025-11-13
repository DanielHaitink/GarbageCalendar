import type {Address, GarbageData} from "../types.ts";

/**
 * Obtain the cache key of the address
 * @param address {Address}
 */
export const getCacheKey = (address: Address) => {
        return `${address.postcode.toUpperCase()}${address.number}${address.suffix?.toUpperCase() || ''}`;
    }

class GarbageCache {
    static RECENT_SEARCHES_KEY = "recentSearches";
    static CACHE_VALIDITY = 1000 * 60 * 60 * 24 * 90;
    static RECENT_SEARCH_MAX = 3;

    recentSearches: Address[] = [];

    constructor() {
        this.recentSearches = JSON.parse(localStorage.getItem(GarbageCache.RECENT_SEARCHES_KEY) || "[]");
    }

    /**
     * Add a recent search to the cache.
     * @param address {Address} An address.
     */
    addRecentSearch(address: Address) {
        let index = -1;
        if (index = this.recentSearches.findIndex(recentSearch => recentSearch.postcode === address.postcode
            && recentSearch.number === address.number && recentSearch.suffix === address.suffix), index >= 0)
            this.recentSearches.splice(index, 1);

        this.recentSearches.unshift(address);

        while (this.recentSearches.length > GarbageCache.RECENT_SEARCH_MAX)
            this.recentSearches.pop();

        localStorage.setItem(GarbageCache.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    }

    /**
     * Get the recent searches as an array of Addresses.
     */
    getRecentSearches() {
        return this.recentSearches;
    }

    /**
     * Store the garbage data in the cache.
     * @param address {Address} The address
     * @param data {GarbageData} The data.
     */
    storeCached(address: Address, data: GarbageData) {
        localStorage.setItem(getCacheKey(address), JSON.stringify(data));
    }

    private isCacheValid(date: Date) {
        return date.getTime() - new Date().getTime() < GarbageCache.CACHE_VALIDITY;
    }

    /**
     * Get the cached data, if any. Returns null if nothing or invalidated data is found.
     * @param address {Address} The address to search for.
     */
    getCached(address: Address) {
        try {
            const data = localStorage.getItem(getCacheKey(address));

            if (data) {
                const parsedData = JSON.parse(data, (key, value) => {
                    if (key === 'date')
                        return new Date(value);
                    return value;
                });

                if (!this.isCacheValid(new Date(parsedData.lastUpdated))) {
                    localStorage.removeItem(getCacheKey(address));
                    return null;
                }

                return parsedData;
            } else
                return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * Clear all the cache.
     */
    clearCache() {
        localStorage.clear();
    }

    /**
     * Clean up the cache.
     */
    cleanCache() {
        for (const key of Object.keys(localStorage)) {
            try {
                const parsed = JSON.parse(localStorage.getItem(key) || "");

                if (!this.isCacheValid(parsed.lastUpdated))
                    localStorage.removeItem(key);
            } catch (e) {
                console.error(e);
                localStorage.removeItem(key);
            }
        }
    }
}

export const cache = new GarbageCache();