class Env {
    production = false;

    constructor() {
        this.production = !import.meta.env.DEV;
    }

    /**
     * Returns true if the environment is in production. False otherwise
     */
    get isProduction() {
        return this.production;
    }

    /**
     * Returns true if the environment is in development. False otherwise.
     */
    get isDevelopment() {
        return !this.production;
    }
}

export const env = new Env();