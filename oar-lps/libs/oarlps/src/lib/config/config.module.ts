import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppConfig } from './config.service';
import { LPSConfig } from './config.model';
import { configFetcherFactory } from 'oarng';

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
