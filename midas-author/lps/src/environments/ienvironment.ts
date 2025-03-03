import { LPSConfig } from 'oarlps';

export interface Context {
    production: boolean;
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
