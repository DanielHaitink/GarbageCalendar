class Pair {
    a = undefined;
    b = undefined;

    /**
     * A value pair
     * @param a {Object} Object a
     * @param b {Object} Object b
     */
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}

export class GarbageCache {
    static DEFAULT_VALIDITY = 1000 * 60 * 60 * 24 * 7; // One week

    cache = {};
    #validity = GarbageCache.DEFAULT_VALIDITY;

    /**
     * @param validity {number} The validity of a value, in milliseconds
     */
    constructor(validity = GarbageCache.DEFAULT_VALIDITY) {
        this.#validity = validity;
    }

    /**
     * Add a key value pair to the cache
     * @param key {string} The key.
     * @param value {Object} A value.
     */
    add(key, value) {
        this.cache[key] = new Pair(Date.now(), value);
    }

    /**
     * Check if the cache has a key
     * @param key {string} The key name.
     * @param checkValidity {boolean} Check if the date is valid as well. Defaults to false.
     * @returns {boolean} True if the key exists.
     */
    has(key, checkValidity = false) {
        // TODO: check for new year and cached data is in past year
        return this.cache[key] &&
            (!checkValidity || Date.now() < this.cache[key].a + this.#validity);
    }

    /**
     * Get a value from the cache
     * @param key
     * @returns {undefined|*|null}
     */
    get(key) {
        if (!this.has(key, true))
            return undefined;

        return this.cache[key].b;
    }

    /**
     * Clean the cache
     */
    clean() {
        for (const key in this.cache)
            if (Date.now() > this.cache[key].a + this.#validity)
                delete this.cache[key];
    }

    /**
     * Clear the cache
     */
    clear() {
        this.cache = {};
    }
}