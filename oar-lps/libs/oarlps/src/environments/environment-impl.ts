/*
 * Angular build-time environments data.
 * 
 * Environment Label: dev (default)
 *
 * When building under the dev environment mode, the contents of this file will get built into 
 * the application.  
 *
 * This is the default version of this file.  When the app is built via `ng build --env=label`,
 * the contents of ./environment.label.ts will be used instead.  
 */
import { IEnvironment } from './ienvironment';
import * as ngenv from './environment';

export const environment: IEnvironment = {
    context: ngenv.context,
    config: ngenv.config,
    testdata: ngenv.testdata
};


