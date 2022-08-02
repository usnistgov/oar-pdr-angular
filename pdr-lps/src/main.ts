import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppBrowserModule } from './app/app.browser.module';
// import {context} from 'oarlps';

document.addEventListener("DOMContentLoaded", () => {
  platformBrowserDynamic().bootstrapModule(AppBrowserModule)
                          .catch(err => console.error(err));
});
