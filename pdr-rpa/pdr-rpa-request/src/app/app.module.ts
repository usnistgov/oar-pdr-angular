import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PanelModule } from 'primeng/panel';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FrameModule } from 'oarng';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { ConfigurationService } from './service/config.service';
import { Observable } from 'rxjs';
import { Secrets } from './model/secrets.model';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

/**
 * The secretsLoadingFactory function returns a function that, when called, 
 * sends an HTTP GET request to the secrets URL and loads the secrets into the ConfigurationService. 
 * 
 * @param configService 
 * @returns 
 */
function secretsLoadingFactory(configService: ConfigurationService): () => Observable<Secrets> {
    return () => configService.loadSecrets(environment.secretsUrl).pipe(
        tap(secrets => {
            configService.secrets = secrets;
        })
    );
}

/**
 * The recaptchaApiKeyFactory function returns an object with the Recaptcha site key 
 * that is obtained from the ConfigurationService.
 * 
 * @param configService 
 * @returns 
 */
function recaptchaApiKeyFactory(configService: ConfigurationService): RecaptchaSettings {
    return { siteKey: configService.secrets.recaptchaApiKey };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        FrameModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        PanelModule,
        PanelModule,
        MessagesModule,
        MessageModule,
        DropdownModule,
        CardModule,
        ChipModule,
        ButtonModule,
        ProgressSpinnerModule,
        OverlayPanelModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        RouterModule.forRoot([])
    ],
    providers: [
        {
            // run the secretsLoadingFactory function before the app starts
            provide: APP_INITIALIZER,
            useFactory: secretsLoadingFactory,
            deps: [ConfigurationService],
            multi: true
        },
        {
            // provide the Recaptcha site key to the Recaptcha module.
            provide: RECAPTCHA_SETTINGS,
            useFactory: recaptchaApiKeyFactory,
            deps: [ConfigurationService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
