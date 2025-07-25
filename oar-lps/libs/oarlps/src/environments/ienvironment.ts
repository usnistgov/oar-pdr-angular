import { LPSConfig } from '../lib/config/config.model';

export interface Context {
    production: boolean;
    configEndpoint?: string|null;
    useMetadataService: boolean;
    // useCustomizationService: boolean;
    useMIDASDAPService: boolean;
    useResourceService: boolean;
}

export interface IEnvironment {
    context: Context;
    config: LPSConfig;
    testdata: {};
}
