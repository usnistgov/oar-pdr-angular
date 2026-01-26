import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// ng-recaptcha
import { RECAPTCHA_BASE_URL } from 'ng-recaptcha';

// oarng components
import { FrameModule, HeaderComponent, FooterComponent } from 'oarng';

// App components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Dynamic form module
import { DynamicFormComponent } from './dynamic-form';

// Services
import { ServiceModule } from './service/service.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forRoot([]),
    AppRoutingModule,

    // Angular Material
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,

    // oarng
    FrameModule,
    HeaderComponent,
    FooterComponent,

    // App (ServiceModule provides RECAPTCHA_SETTINGS)
    ServiceModule,
    DynamicFormComponent
  ],
  providers: [
    {
      provide: RECAPTCHA_BASE_URL,
      useValue: 'https://recaptcha.net/recaptcha/api.js'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
