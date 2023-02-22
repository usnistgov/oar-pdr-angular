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

@NgModule({
  declarations: [
    AppComponent,
    UnescapeHTMLPipe
  ],
  imports: [
    BrowserModule, 
    FormsModule, 
    PanelModule, 
    MessagesModule, 
    MessageModule, 
    DropdownModule, 
    CardModule, 
    ChipModule, 
    ButtonModule, 
    ProgressSpinnerModule, 
    OverlayPanelModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
