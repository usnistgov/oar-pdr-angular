import { LPSConfig } from '../lib/config/config';

export interface Context {
    production: boolean;
    configEndpoint?: string|null;
    useMetadataService: boolean;
    useCustomizationService: boolean;
}

export interface IEnvironment {
    context: Context;
    config: LPSConfig;
    testdata: {};
}
