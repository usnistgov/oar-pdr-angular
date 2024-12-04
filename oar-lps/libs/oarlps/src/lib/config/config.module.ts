import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ConfigService } from './config.service';
import { LPSConfig } from './config.model';
import { configFetcherFactory } from 'oarng';

/**
 * a service module providing an extension of the common ConfigurationService.  
 */
@NgModule({
    providers: [
        HttpClient,
        ConfigService,
        { provide: APP_INITIALIZER, useFactory: configFetcherFactory,
          deps: [ ConfigService ], multi: true }
    ]
})
export class ConfigModule { }

export { ConfigService, LPSConfig }
