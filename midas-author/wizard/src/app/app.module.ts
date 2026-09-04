import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
} from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StepWizModule } from './startwiz/stepwizard.module';
import { WizardModule } from 'oarng';
import { AuthModule, RELEASE_INFO } from 'oarng';
import { RELEASE } from '../environments/release-info';
import { HttpClientModule } from '@angular/common/http';
import { ConfigModule, MetadataUpdateService } from 'oarlps';
import { GoogleAnalyticsService, SidebarService } from "oarlps";
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent, HeaderComponent } from 'oarng';
import { PeopleComponent } from 'oarlps';
import { SDSuggestion, SDSIndex, StaffDirectoryService, AuthenticationService } from 'oarng';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StepWizModule,
    AppRoutingModule,
    WizardModule,
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
    HeaderComponent,
    PeopleComponent,
    FontAwesomeModule,
  ],
  providers: [
    { provide: RELEASE_INFO, useValue: RELEASE },
    GoogleAnalyticsService,
    MetadataUpdateService,
    SidebarService,
    StaffDirectoryService,
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        position: 'above',
      },
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
