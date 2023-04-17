import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigurationService } from './config.service';
import { RPAService } from './rpa.service';

export function configFetcherFactory(configSvc: ConfigurationService) {
    return () => { 
        return configSvc.fetchConfig().toPromise();
    };
}

@NgModule({
    providers: [
        HttpClient,
        ConfigurationService,
        RPAService,
        { provide: APP_INITIALIZER, useFactory: configFetcherFactory,
          deps: [ ConfigurationService ], multi: true }
    ]
})
export class ServiceModule { }

export { ConfigurationService, RPAService }
