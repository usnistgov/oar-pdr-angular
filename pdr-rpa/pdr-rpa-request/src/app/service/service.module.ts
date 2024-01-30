import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Observable, from } from 'rxjs';

import { RPAService } from './rpa.service';
import { ConfigurationService } from './config.service';
import { environment } from '../../environments/environment';

export function configFetcherFactory(configSvc: ConfigurationService) {
    return () => { 
        return configSvc.fetchConfig().toPromise();
    };
}

export function recaptchaApiKeyFactory(configService: ConfigurationService): RecaptchaSettings {
    return { siteKey: configService.getConfig()['recaptchaApiKey'] };
}

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ], 
    providers: [
        HttpClient,
        ConfigurationService,
        RPAService,
        {
            provide: RECAPTCHA_SETTINGS,
            useFactory: recaptchaApiKeyFactory,
            deps: [ConfigurationService]
        },
        { provide: APP_INITIALIZER, useFactory: configFetcherFactory,
          deps: [ ConfigurationService ], multi: true }
    ]
})
export class ServiceModule { }

export { ConfigurationService, RPAService }
