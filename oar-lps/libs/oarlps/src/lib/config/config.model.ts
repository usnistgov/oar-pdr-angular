/**
 * Interfaces defining the configuration data model
 * 
 * Configuration parameters used by the application are defined in the form of
 * interfaces.  The AppConfig is an implementation of the app-level configuration
 * interface, LPSConfig, that can be injected into Components.  
 * 
 * See src/assets/config.json for an example configuration data file.
 */
import { Injectable } from '@angular/core';

// import { AnyObject } from 'oarng/data/data.module';

/**
 * URLs to key repository URLs used as user-clickable links.  This URLs are intended to appear
 * as values of href attributes in HTML links.  Because these locations appear in HTML, and 
 * therefore accessed browser-side exclusively, they must publicly-accessible URLs.
 *
 * These values can also serve as defaults for infering URLs--including API endpoints--that
 * are not explicitly set.
 */
export interface WebLinks {

    /**
     * the institutional home page (e.g. NIST)
     */
    orgHome: string;

    /**
     * the science portal base URL (e.g. https://data.nist.gov/)
     */
    portalBase?: string;

    /**
     * the base URL for PDR links
     */
    portalBase?: string;

    /**
     * the home page for the PDR
     */
    pdrHome?: string;

    /**
     * the PDR search page (i.e. the SDP search page)
     */
    pdrSearch?: string;

    /**
     * the PDR identifier resolver base URL (e.g. "/od/id/")
     */
    pdrIDResolver?: string;

    /**
     * the distribution service base URL (e.g. "/od/ds/")
     */
    distService?: string;

    /**
     * the NERDm info page
     */
    nerdmAbout?: string;

    /**
     * other locations are allowed
     */
    [locName: string]: any;
}

/**
 * Public PDR API endpoint URLs.  These base URLs are intended for services accessed via 
 * Typescript code (as opposed to those that appear in HTML links).  These are intended to 
 * be for public API endpoints of the PDR (even when running in a MIDAS/DAPTool context). 
 */
/*
 * The proper API URL to use can depend on whether the code is running server-side
 * or browser-side.  One should set server-side URLs under "serverSide"; these will 
 * automatically over-ride the ones above them on the serverSide (via the ConfigService).
 * Thus, always access the URL parameters via their normal names.  
 *
 * For example, the metadata resolver service API, "mdService", needs to be accessed 
 * via Typescript code, set the browser-side version of the URL as "APIs.mdSearch", 
 * and set the service-side as "APIs.serverSide.mdSearch"; regardless, always access 
 * the parameter via "APIs.mdSearch" to get the appropriate version.  
 */
export interface PDRAPIEndpoints {

    /**
     * the base URL for the ID-to-metadata resolving service
     */
    mdService?: string;

    /**
     * the (RMM) metadata search endpoint.  This URL is expected to be appended with a 
     * search query for returning arbitrary metadata.  Note that the mdService is intended 
     * for resolving an ID into a specific metadata record.
     */
    mdSearch?: string;

    /**
     * the metrics data API.
     */
    metrics?: string;

    /**
     * the base URL for the distribution service API (including data bundling)
     */
    distService?: string;

    /**
     * the server-side versions of the above URLs.  
     */
    serverSide?: PDRAPIEndpoints;

    /**
     * other API URLs are allowed
     */
    [locName: string]: any;
}

/**
 * Configuration for 
 */
export interface DAPService {

    /**
     * the DAP service endpoint URL 
     */
    serviceEndpoint: string;

    /**
     * a flag indicating whether editing should be enabled.  If false, the app should not enable 
     * metadata editing widgets.
     */
    editEnabled: boolean;
}

/**
 * the aggregation of parameters needed to configure the Landing Page Service (LPS).  This interface 
 * only includes parameters necessary for creating the public, non-editable version of a landing
 * page.  (See also extension, DAPToolConfig)
 */
export interface LPSConfig extends Configuration {

    /**
     * URLs used in links plugged into HTML templates
     */
    links: WebLinks;

    /**
     * Endpoint URLs for APIs accessed from code
     */
    PDRAPIs: PDRAPIEndpoints;

    /**
     * Google Analytics 4 code
     */
    ga4Code?: string;

    /**
     * a label to display (in the head bar) indicating the status of displayed interface.  
     *
     * This is usually populated in production contexts; example values
     * include "Review Version", "Dev Version".  
     */
    status?: string;

    /**
     * other parameters are allowed
     */
    [propName: string]: any;
}


