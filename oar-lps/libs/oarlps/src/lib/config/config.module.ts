import { ModuleWithProviders, NgModule, PLATFORM_ID, APP_INITIALIZER, Optional } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { AppConfig, LPSConfig, WebLocations } from './config'
import { ConfigService, newConfigService, RemoteFileConfigService, CFG_DATA } from './config.service'
import { IEnvironment } from '../../environments/ienvironment';
import { environment } from '../../environments/environment-impl';

export function getAppConfig(configService: ConfigService) : AppConfig {
    let out : AppConfig = configService.getConfig();
    console.log("App status, according to the configuration: " + out.status);
    return out;
}

export function configFetcherFactory(http: HttpClient, configSvc: ConfigService) {
    return () => { 
        if (configSvc instanceof RemoteFileConfigService) 
            return (configSvc as RemoteFileConfigService).fetch(http).toPromise();
        return Promise.resolve({});
    };
}    

/**
 * a service module providing the application configuration infrastructure.  Its 
 * ultimate purpose is to provide an AppConfig singleton, containing configuration 
 * data, making available for injection throughout the app.  
 */
@NgModule({
    providers: [
        HttpClient,
        { provide: ConfigService, useFactory: newConfigService,
          deps: [ environment, PLATFORM_ID, TransferState, HttpClient ] },
        { provide: AppConfig, useFactory: getAppConfig, deps: [ ConfigService ] },
        { provide: APP_INITIALIZER, useFactory: configFetcherFactory,
          deps: [ HttpClient, ConfigService], multi: true }
    ]
})
export class ConfigModule { 
    public static forRoot(env: IEnvironment): ModuleWithProviders<ConfigModule> {

        return {
          ngModule: ConfigModule,
          providers: [
            { provide: environment, useValue: env }
          ]
        };
    } 
}
