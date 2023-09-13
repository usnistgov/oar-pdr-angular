import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { PanelModule } from 'primeng/panel';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FrameModule } from 'oarng';
import { RECAPTCHA_BASE_URL, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { ServiceModule } from './service/service.module';
import { RequestFormTermsComponent } from './components/request-form-terms/request-form-terms.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [
        AppComponent,
        RequestFormTermsComponent
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
        ToastModule,
        ProgressSpinnerModule,
        OverlayPanelModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        ServiceModule,
        RouterModule.forRoot([])
    ],
    providers: [
        {
            provide: RECAPTCHA_BASE_URL,
            useValue: "https://recaptcha.net/recaptcha/api.js", // "google.com" domain might be unavailable in some countries
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
