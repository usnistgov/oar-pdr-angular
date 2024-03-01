import { NgModule }    from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import {
    APP_INITIALIZER, PLATFORM_ID, APP_ID, Inject,
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
} from '@angular/core';
import { enableProdMode } from '@angular/core';
import { ErrorHandler } from '@angular/core';

import { HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';

import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { LandingPageModule } from './landing/landingpage.module';
import { LandingAboutModule } from 'oarlps';
import { SharedModule } from 'oarlps';
import { FragmentPolyfillModule } from "./fragment-polyfill.module";
import { ErrorsModule, AppErrorHandler } from 'oarlps';

// import { ConfigModule } from './config/config.module';
import { DatacartModule } from 'oarlps';
import { DirectivesModule } from 'oarlps';
import { MetricsModule } from 'oarlps';

// import { ErrorComponent, UserErrorComponent } from './landing/error.component';
import { ModalComponent } from 'oarlps';
import { ComboBoxComponent } from 'oarlps';
import { SearchTopicsComponent } from 'oarlps';
import { GoogleAnalyticsService} from "oarlps";
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';

// import { FrameModule } from 'oarlps';
import { OARLPSModule } from 'oarlps';
import { environment } from '../environments/environment-impl';
import { NerdmModule } from 'oarlps';
import { ConfigModule } from 'oarlps';
import { EditControlModule } from 'oarlps';

import { OARngModule } from 'oarng';
import { FrameModule } from 'oarng';
import { WizardModule } from 'oarng';

enableProdMode();

/**
 * The Landing Page Service Application
 */
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        // ConfigModule,
        FrameModule,
        OARLPSModule,
        WizardModule,
        ErrorsModule,
        LandingPageModule,
        AppRoutingModule,
        LandingAboutModule,
        DirectivesModule,
        DatacartModule,
        MetricsModule,
        SharedModule.forRoot(),
        // FragmentPolyfillModule.forRoot({
        //     smooth: true
        // }),
        HttpClientModule, FormsModule, ReactiveFormsModule,
        CommonModule, BrowserAnimationsModule, FormsModule,
        ToastrModule.forRoot({
            toastClass: 'toast toast-bootstrap-compatibility-fix'
        }),
        NgbModule,
        NerdmModule.forRoot(environment),
        ConfigModule.forRoot(environment),
        EditControlModule.forRoot(environment)
    ],
    exports: [],
    providers: [
        AppErrorHandler,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        GoogleAnalyticsService,
        DatePipe,
        fakeBackendProvider
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class AppModule {
    // We inject the service here to keep it alive whole time
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { } 
}


