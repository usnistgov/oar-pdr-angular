import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { PanelModule } from 'primeng/panel';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { UnescapeHTMLPipe } from './pipe/unescape-html.pipe';
import { ConfigModule, CONFIG_URL, RELEASE_INFO, FrameModule, AuthModule } from 'oarng';
import { environment } from '../environments/environment';
import { RELEASE } from '../environments/release-info';
import { ServiceModule } from './service/service.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [
        AppComponent,
        UnescapeHTMLPipe
    ],
    imports: [
        FrameModule,
        BrowserModule, 
        FormsModule, 
        PanelModule, 
        MessagesModule, 
        MessageModule, 
        DropdownModule, 
        CardModule, 
        ChipModule, 
        ButtonModule, 
        ToastModule,
        ProgressSpinnerModule, 
        OverlayPanelModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AuthModule,
        ServiceModule,
        RouterModule.forRoot([])
    ],
    providers: [
        { provide: RELEASE_INFO, useValue: RELEASE },
        { provide: CONFIG_URL, useValue: environment.configUrl }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
