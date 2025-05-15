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
      portalBase: "https://localhost/",
      pdrHome: "https://localhost/pdr/",
      pdrSearch: "https://localhost/sdp/",
      mdService:   "https://localhost/rmm/",
  },
  PDRAPIs: {
      mdSearch: "https://localhost/rmm/records/",
      mdService: "https://localhost/od/id/",
      metrics: "https://data.nist.gov/rmm/usagemetrics/"
  },
  dapEditing: {
      serviceEndpoint: "https://localhost/midas/dap/mds3/",
      editEnabled: true,
  },
  systemVersion: "v1.3.X",
  mode: "dev",
  production: environment.production,
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
