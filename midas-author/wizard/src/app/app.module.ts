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
import { ConfigModule } from 'oarng';
import { GoogleAnalyticsService} from "oarlps";
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
        HttpClientModule,
        ConfigModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            toastClass: 'toast toast-bootstrap-compatibility-fix',
            timeOut: 15000, // 15 seconds
            closeButton: true,
            progressBar: true,
        }),
    ],
    providers: [
        GoogleAnalyticsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
