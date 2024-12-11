// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { LPSConfig } from 'oarlps';

export const environment = {
    production: false,
    configUrl: 'assets/config.json'
};

export const config: LPSConfig = {
    links: {
        orgHome: "https://nist.gov/",
        portalBase: "https://mdsdev.nist.gov/",
        pdrHome: "https://mdsdev.nist.gov/pdr/",
        pdrSearch: "https://mdsdev.nist.gov/sdp/",
        mdService:   "https://mdsdev.nist.gov/rmm/",
    },
    PDRAPIs: {
        mdSearch: "https://mdsdev.nist.gov/rmm/records/",
        mdService: "https://mdsdev.nist.gov/od/id/",
        metrics: "https://data.nist.gov/rmm/usagemetrics/"
    },
    dapAPI: "https://mdsdev.nist.gov/midas/dap/mds3/",
    mode: "dev",
    status: "Dev Version",
    appVersion: "v1.3.X",
    production: environment.production,
    editEnabled: true,
    distService: "https://mdsdev.nist.gov/od/ds/",
    gaCode: "not-set",
    screenSizeBreakPoint: 1200,
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
