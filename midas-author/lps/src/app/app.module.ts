import { NgModule }    from '@angular/core';
import {
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
} from '@angular/core';
import { enableProdMode } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { LandingPageModule } from './landing/landingpage.module';
import { LandingAboutComponent } from 'oarlps';
import { SharedModule } from 'oarlps';
import { ErrorsModule, AppErrorHandler } from 'oarlps';
import { DirectivesModule } from 'oarlps';
import { GoogleAnalyticsService} from "oarlps";
import { fakeBackendProvider } from './_helpers/fakeBackendInterceptor';
import { OARLPSModule } from 'oarlps';
import { environment } from '../environments/environment-impl';
import { NerdmModule } from 'oarlps';
import { ConfigModule } from 'oarlps';
import { FrameModule } from 'oarng';
import { StaffDirModule } from 'oarng';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { EditControlModule } from 'oarlps';
import { MetadataUpdateService } from 'oarlps';

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
      LandingAboutComponent,
      ConfigModule.forRoot(environment),
      StaffDirModule,
      EditControlModule,
    ],
    exports: [AppComponent],
    providers: [
        AppErrorHandler,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        {
          provide: UrlSerializer,
          useClass: LowerCaseUrlSerializer
        },
        GoogleAnalyticsService,
        DatePipe,
        MetadataUpdateService,
        fakeBackendProvider
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class AppModule {
    // We inject the service here to keep it alive whole time
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { }
}


