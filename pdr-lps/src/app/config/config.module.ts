import { NgModule, PLATFORM_ID, Optional } from '@angular/core';
import { BrowserTransferStateModule, TransferState } from '@angular/platform-browser';

import { AppConfig, LPSConfig, WebLocations } from 'oarlps'
import { ConfigService, newConfigService, CFG_DATA } from 'oarlps'
import { EnvironmentService } from '../../environments/environment.service';
import * as ngenv from '../../environments/environment';

export function getAppConfig(configService: ConfigService) : AppConfig {
    let out : AppConfig = configService.getConfig();
    console.log("App status, according to the configuration: " + out.status);
    return out;
}

/**
 * a service module providing the application configuration infrastructure.  Its 
 * ultimate purpose is to provide an AppConfig singleton, containing configuration 
 * data, making available for injection throughout the app.  
 */
@NgModule({
    providers: [
        { provide: EnvironmentService, useValue: ngenv },
        { provide: ConfigService, useFactory: newConfigService,
          deps: [ EnvironmentService, PLATFORM_ID, TransferState ] },
        { provide: AppConfig, useFactory: getAppConfig, deps: [ ConfigService ] }
    ]
})
export class ConfigModule { }
