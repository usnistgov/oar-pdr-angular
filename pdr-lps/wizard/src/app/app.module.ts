import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StepWizModule } from './startwiz/stepwizard.module';
import { WizardModule } from 'oarng';
import { OARngModule } from 'oarng';
import { FrameModule } from 'oarng';
import { InputTextModule } from "primeng/inputtext";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        StepWizModule,
        AppRoutingModule,
        WizardModule,
        InputTextModule,
        OARngModule,
        FrameModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
