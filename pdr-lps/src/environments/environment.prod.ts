export const environment = {
  production: true,
  RMMAPI: 'http://testdata.nist.gov/rmm/',
  SDPAPI:  'http://testdata.nist.gov/sdp/',
  PDRAPI:  'http://localhost:5555/#/id/',
  DISTAPI: 'https://localhost/od/ds/',
  METAPI:  'http://localhost/metaurl/',
  LANDING: 'http://testdata.nist.gov/rmm/'
};

import { LPSConfig } from 'oarlps';

export const context = {
    production: true,
    useMetadataService: false,
    useCustomizationService: true,
    useMIDASDAPService: false,
    useResourceService: true
};

export const config : LPSConfig = {
    links: {
        orgHome:     "https://nist.gov/",
        portalBase:  "https://data.nist.gov/",
        pdrHome:     "https://data.nist.gov/pdr/",
        pdrSearch: "https://data.nist.gov/sdp/",
        mdService:   "https://data.nist.gov/rmm/"
    },
    PDRAPIs: {
        mdSearch: "https://mdsdev.nist.gov/rmm/records/",
        mdService: "https://mdsdev.nist.gov/od/id/",
        metrics: "https://data.nist.gov/rmm/usagemetrics/"
    },
    dapEditing: {
        serviceEndpoint: "https://mdsdev.nist.gov/midas/dap/mds3/",
        editEnabled: false,
    },    
    systemVersion: "v1.3.X",
    distService: "https://data.nist.gov/od/ds/",
    mode:        "prod",
    status:      "Dev Version",
    appVersion:  "v1.1.0",
    production:  context.production,
    editEnabled: false,
    gacode: "not-set",
    screenSizeBreakPoint: 1060,
    bundleSizeAlert: 500000000,
    embedMetadata: "schema.org",
    downloadableFileLimit: 300,
    // Decide how many seconds to wait to refresh metrics after user download one/more files
    delayTimeForMetricsRefresh: 300,
    standardNISTTaxonomyURI: "https://data.nist.gov/od/dm/nist-themes/"
}

export const testdata : {} = { }

