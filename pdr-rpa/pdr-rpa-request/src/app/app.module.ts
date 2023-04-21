import { NgModule} from '@angular/core';
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
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { ServiceModule } from './service/service.module';
import { RequestFormTermsComponent } from './components/request-form-terms/request-form-terms.component';


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
        ProgressSpinnerModule,
        OverlayPanelModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        ServiceModule,
        RouterModule.forRoot([])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
