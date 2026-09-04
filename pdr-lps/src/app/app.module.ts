import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, enableProdMode, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment-impl';
import { LandingPageComponent } from './landing/landingpage.component';
import { LandingAboutModule, SharedModule, DatacartModule, DirectivesModule, 
         OARLPSModule, NerdmModule, ConfigModule, 
         BrowserMetadataTransferModule} from 'oarlps';
import { GoogleAnalyticsService, CollectionService, ConfirmationDialogService } from 'oarlps';
import { ErrorsModule, AppErrorHandler } from 'oarlps';
import { HeaderPubComponent, FooterComponent } from 'oarng';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatBadgeModule } from "@angular/material/badge";
import { MatTooltipModule } from "@angular/material/tooltip";

enableProdMode();

// export function initializeApp(collectionService: CollectionService) {
//   return async () => {
//     await collectionService.loadLocalData()
//   };
// }

/**
 * The Landing Page Service Application
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    OARLPSModule,
    ErrorsModule,
    AppRoutingModule,
    LandingAboutModule,
    DirectivesModule,
    DatacartModule,
    SharedModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      toastClass: "toast toast-bootstrap-compatibility-fix",
    }),
    NerdmModule.forRoot(environment),
    ConfigModule,
    HeaderPubComponent,
    LandingPageComponent,
    FooterComponent,
    BrowserMetadataTransferModule,
    FontAwesomeModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  exports: [],
  providers: [
    AppErrorHandler,
    { provide: ErrorHandler, useClass: AppErrorHandler },
    GoogleAnalyticsService,
    CollectionService,
    ConfirmationDialogService,
    DatePipe,
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        position: "above",
      },
    },
    // {
    //     provide: APP_INITIALIZER,
    //     useFactory: initializeApp,
    //     deps: [CollectionService],
    //     multi: true
    // }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {
  // We inject the service here to keep it alive whole time
  constructor(protected _googleAnalyticsService: GoogleAnalyticsService) {}
}


