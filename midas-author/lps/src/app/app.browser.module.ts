import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { BrowserMetadataTransferModule } from 'oarlps';

@NgModule({
    imports: [
        BrowserModule.withServerTransition({ appId: 'PDR-LandingPageService' }),
        BrowserAnimationsModule,
        AppModule,
        BrowserMetadataTransferModule
    ],
    bootstrap: [ AppComponent ]
})
export class AppBrowserModule { }
