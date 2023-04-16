export interface Configuration {
    /**
     * the base URL to assume for this application
     */
    baseUrl: string;

    /**
     * other parameters are allowed
     */
    [paramName: string]: any;
}
