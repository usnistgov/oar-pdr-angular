import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StepWizModule } from './startwiz/stepwizard.module';
import { WizardModule } from 'oarng';
import { OARngModule } from 'oarng';
import { FrameModule } from 'oarng';
import { InputTextModule } from "primeng/inputtext";
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from './startwiz/services/config-service.service';

/**
 * Initialize the configs for backend services
 */
const appInitializerFn = (appConfig: AppConfig) => {
    return () => {
      console.log("**** CAlling APP Initialization ***");
      return appConfig.loadAppConfig();
    };
};

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
        FrameModule,
        HttpClientModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFn,
            multi: true,
            deps: [AppConfig]
        },
        fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
