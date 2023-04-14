import { NgModule, APP_INITIALIZER } from '@angular/core';
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
import { ServiceModule, ConfigurationService } from './service/service.module';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

/**
 * The recaptchaApiKeyFactory function returns an object with the Recaptcha site key 
 * that is obtained from the ConfigurationService.
 * 
 * @param configService 
 * @returns 
 */
function recaptchaApiKeyFactory(configService: ConfigurationService): RecaptchaSettings {
    return { siteKey: configService.getConfig().recaptchaApiKey };
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

        ServiceModule,
        RouterModule.forRoot([])
    ],
    providers: [
        {
            // provide the Recaptcha site key to the Recaptcha module.
            provide: RECAPTCHA_SETTINGS,
            useFactory: recaptchaApiKeyFactory,
            deps: [ConfigurationService, APP_INITIALIZER]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
