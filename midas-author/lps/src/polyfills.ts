/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
* BROWSER POLYFILLS
*/

import 'core-js/es7/object';
import 'core-js/es7/array';  // Run `npm install --save classlist.js`.

/** Evergreen browsers require these. **/
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';



/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */

/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
// import 'intl';  // Run `npm install --save intl`.
/**
 * Need to import at least one locale-data with intl.
 */
// import 'intl/locale-data/jsonp/en';

(window as any).global = window;

if (!('animate' in document.documentElement) || (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent))) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/web-animations-js@2.3.2';
    document.head.appendChild(script);
}
