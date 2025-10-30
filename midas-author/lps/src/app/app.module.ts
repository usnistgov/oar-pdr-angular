import { NgModule }    from '@angular/core';
import {
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
} from '@angular/core';
import { enableProdMode } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing/landingpage.component';
import { environment } from '../environments/environment-impl';
import { StaffDirModule } from 'oarng';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { FooterComponent, HeaderComponent, HeaderPubComponent } from 'oarng';
import { OARLPSModule, ConfigModule, EditControlModule, UserMessageService,
         GoogleAnalyticsService, ErrorsModule, AppErrorHandler, LandingAboutComponent
} from 'oarlps';
 import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
      ConfigModule,
      StaffDirModule,
      EditControlModule.forRoot(environment),
      FooterComponent,
      HeaderComponent,
      HeaderPubComponent,
      LandingPageComponent
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
        UserMessageService,
        NgbActiveModal
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})

export class AppModule {
    // We inject the service here to keep it alive whole time
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { }
}


