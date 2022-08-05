import { LPSConfig } from '../lib/config/config';

export interface Context {
    production: boolean;
    useMetadataService: boolean;
    useCustomizationService: boolean;
}

export interface IEnvironment {
    context: Context;
    config: LPSConfig;
    testdata: {};
}