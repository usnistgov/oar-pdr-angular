import { Configuration } from 'oarng';

export interface RPAConfiguration extends Configuration {
    /**
     * the base URL to assume for this application
     */
    baseUrl: string;

    /*
     * Note: other parameters are allowed (as per the parent interface)
     */
}
