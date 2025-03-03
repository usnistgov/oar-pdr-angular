import { LPSConfig } from 'oarlps';

export interface Context {
    production: boolean;
    useResourceService: boolean;
    useMIDASDAPService: boolean;
}

export interface IEnvironment {
    context: Context;
    config: LPSConfig;
    testdata: {};
}