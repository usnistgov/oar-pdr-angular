import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { ConfigurationService } from './config.service';
import { RPAService } from './rpa.service';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Observable, from } from 'rxjs';
import { Configuration } from '../model/config.model';

export function configFetcherFactory(configService: ConfigurationService): () => Observable<Configuration> {
    return () => {
      return from(configService.fetchConfig());
    };
  }


export function recaptchaApiKeyFactory(configService: ConfigurationService): RecaptchaSettings {
    return { siteKey: configService.getConfig().recaptchaApiKey };
}

@NgModule({
    declarations: [],
    imports: [
      CommonModule
    ], 
    providers: [
        HttpClient,
        ConfigurationService,
        {
            provide: APP_INITIALIZER, useFactory: configFetcherFactory,
            deps: [ConfigurationService], multi: true
        },
        {
            provide: RECAPTCHA_SETTINGS,
            useFactory: recaptchaApiKeyFactory,
            deps: [ConfigurationService]
        },
        RPAService,
    ]
})
export class ServiceModule { }

export { ConfigurationService, RPAService }
