import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { AppBrowserModule } from './app/app.browser.module';
import { bootstrapApplication } from '@angular/platform-browser';
// import {context} from 'oarlps';

document.addEventListener("DOMContentLoaded", () => {
  platformBrowserDynamic().bootstrapModule(AppBrowserModule)
                          .catch(err => console.error(err));
});
