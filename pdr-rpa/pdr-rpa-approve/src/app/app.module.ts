import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { UnescapeHTMLPipe } from './pipe/unescape-html.pipe';
import { ConfigModule, CONFIG_URL, RELEASE_INFO, FrameModule, AuthModule } from 'oarng';
import { environment } from '../environments/environment';
import { RELEASE } from '../environments/release-info';
import { ServiceModule } from './service/service.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from 'oarng';
import { FooterComponent } from 'oarng';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
    declarations: [
        AppComponent,
        UnescapeHTMLPipe
    ],
    imports: [
        FrameModule,
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AuthModule,
        ServiceModule,
        RouterModule.forRoot([]),
        HeaderComponent,
        FooterComponent,
        // Angular Material
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatDividerModule,
        MatChipsModule
    ],
    providers: [
        { provide: RELEASE_INFO, useValue: RELEASE },
        { provide: CONFIG_URL, useValue: environment.configUrl }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
