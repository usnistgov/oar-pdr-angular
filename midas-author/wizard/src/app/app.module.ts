import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StepWizModule } from './startwiz/stepwizard.module';
import { WizardModule } from 'oarng';
import { AuthModule, RELEASE_INFO } from 'oarng';
import { RELEASE } from '../environments/release-info';
import { InputTextModule } from "primeng/inputtext";
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';
import { HttpClientModule } from '@angular/common/http';
import { ConfigModule } from 'oarlps';
import { GoogleAnalyticsService} from "oarlps";
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent, HeaderComponent } from 'oarng';

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
        AuthModule,
        HttpClientModule,
        ConfigModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            toastClass: 'toast toast-bootstrap-compatibility-fix',
            timeOut: 15000, // 15 seconds
            closeButton: true,
            progressBar: true,
        }),
        FooterComponent,
        HeaderComponent
    ],
    providers: [
      { provide: RELEASE_INFO, useValue: RELEASE },
      GoogleAnalyticsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
