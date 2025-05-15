// import { ModuleWithProviders, NgModule, PLATFORM_ID, APP_INITIALIZER, Optional } from '@angular/core';
// import { TransferState } from '@angular/core';
import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { AppConfig, LPSConfig, WebLocations } from './config'
// import { ConfigService, newConfigService, RemoteFileConfigService, CFG_DATA } from './config.service'
// import { IEnvironment } from '../../environments/ienvironment';
// import { environment } from '../../environments/environment-impl';
import { CommonModule } from '@angular/common';
import { AppConfig } from './config.service';
import { LPSConfig } from './config.model';
import { configFetcherFactory } from 'oarng';

// export function getAppConfig(configService: ConfigService) : AppConfig {
//     let out : AppConfig = configService.getConfig();
//     console.log("App status, according to the configuration: " + out.status);
//     return out;
// }

// export function configFetcherFactory(http: HttpClient, configSvc: ConfigService) {
//     return () => { 
//         if (configSvc instanceof RemoteFileConfigService) 
//             return (configSvc as RemoteFileConfigService).fetch(http).toPromise();
//         return Promise.resolve({});
//     };
// }    

/**
 * a service module providing an extension of the common ConfigurationService.  
 */
@NgModule({
    providers: [
        HttpClient,
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: configFetcherFactory,
            deps: [ AppConfig ], multi: true }
    ]
})
export class ConfigModule { }
export { AppConfig, LPSConfig }