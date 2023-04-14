export interface Configuration {
    /**
     * the base URL to assume for this application
     */
    baseUrl: string;

    /**
     * token used to interact with Google's reCAPTCHA service
     */
    recaptchaApiKey: string;

    /**
     * other parameters are allowed
     */
    [paramName: string]: any;
}
