/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import { enableProdMode } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import { AppServerModule } from '../server';
export { AppServerModule } from './app/app.server.module';

enableProdMode();
export { renderModule } from '@angular/platform-server';
