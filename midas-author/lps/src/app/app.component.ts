import { Component, AfterViewInit, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet, RouterLink } from '@angular/router';
// import './content/modal.less';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { LandingPageComponent } from './landing/landingpage.component';
import { LandingPageModule } from './landing/landingpage.module';
import { ErrorsModule, AppErrorHandler } from 'oarlps';

import { enableProdMode } from '@angular/core';
import { ErrorHandler } from '@angular/core';

import { HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';

import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LandingAboutComponent } from 'oarlps';
import { SharedModule } from 'oarlps';
import { FragmentPolyfillModule } from "./fragment-polyfill.module";

// import { ConfigModule } from './config/config.module';
import { DatacartModule } from 'oarlps';
import { DirectivesModule } from 'oarlps';
import { MetricsModule } from 'oarlps';
import { ModalComponent } from 'oarlps';
import { ComboBoxComponent } from 'oarlps';
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';
import { OARLPSModule } from 'oarlps';
import { environment } from '../environments/environment-impl';
import { NerdmModule } from 'oarlps';
import { ConfigModule } from 'oarlps';
import { EditControlModule } from 'oarlps';
import { OARngModule, AuthenticationService } from 'oarng';
import { WizardModule, StaffDirModule } from 'oarng';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import {
  APP_INITIALIZER, APP_ID,
  CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
} from '@angular/core';
import { GlobalService } from 'oarlps';
import { NgToastService, TOAST_POSITIONS } from 'ng-angular-popup';

export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  parse(url: string): UrlTree {
      // Optional Step: Do some stuff with the url if needed.

      // If you lower it in the optional step
      // you don't need to use "toLowerCase"
      // when you pass it down to the next function
      return super.parse(url.toLowerCase());
  }
}

enableProdMode();

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'PDR Resource Landing Page';
    gaCode: string;
    inBrowser: boolean = false;
    appVersion: string = "1.0"
    authToken: string|null = null;
    TOAST_POSITIONS = TOAST_POSITIONS; 
    
    constructor(private gaService: GoogleAnalyticsService,
                // public environmentService : EnvironmentService,
                private authsvc: AuthenticationService,
                private cfg: AppConfig,
                public globalService: GlobalService,
                @Inject(PLATFORM_ID) private platformId: Object)
    {
        this.inBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
      this.appVersion = this.cfg.get("systemVersion", "X.X") as string;

      this.authsvc.getCredentials().subscribe(
        creds => {
            if (creds.token) {
                this.authToken = creds.token;
            }
        }
      );
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized.
        // Applies to components only.
        if(this.inBrowser){
            this.gaCode = this.cfg.get("gaCode", "") as string;
            this.gaService.appendGaTrackingCode(this.gaCode);
        }
    }


}

