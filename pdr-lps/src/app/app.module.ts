import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, enableProdMode, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment-impl';
import { LandingPageComponent } from './landing/landingpage.component';
import { LandingAboutModule, SharedModule, DatacartModule, DirectivesModule, 
         MetricsModule, OARLPSModule, NerdmModule, ConfigModule } from 'oarlps';
import { GoogleAnalyticsService, UserMessageService } from 'oarlps';
import { ErrorsModule, AppErrorHandler } from 'oarlps';
import { HeaderPubComponent, FooterComponent } from 'oarng';

enableProdMode();

/**
 * The Landing Page Service Application
 */
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        OARLPSModule,
        ErrorsModule,
        AppRoutingModule,
        LandingAboutModule,
        DirectivesModule,
        DatacartModule,
        MetricsModule,
        SharedModule.forRoot(),
        HttpClientModule, 
        FormsModule, 
        ReactiveFormsModule,
        CommonModule, 
        BrowserAnimationsModule, 
        ToastrModule.forRoot({
            toastClass: 'toast toast-bootstrap-compatibility-fix'
        }),
        NgbModule,
        NerdmModule.forRoot(environment),
        ConfigModule,
        HeaderPubComponent,
        LandingPageComponent,
        FooterComponent
    ],
    exports: [],
    providers: [
        AppErrorHandler,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        GoogleAnalyticsService,
        UserMessageService,
        // fakeBackendProvider,
        DatePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class AppModule {
    // We inject the service here to keep it alive whole time
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { } 
}


