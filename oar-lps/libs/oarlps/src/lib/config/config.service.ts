import { Injectable, Inject, Optional, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformServer } from '@angular/common';

import { ConfigurationService } from 'oarng';
import { ReleaseInfo, RELEASE_INFO, CONFIG_URL } from 'oarng';
import { LPSConfig } from './config.model';
// import { RELEASE } from '../../environments/release-info';

@Injectable({
    providedIn: 'root',
})
export class AppConfig extends ConfigurationService {
    isOnServer: boolean;

    constructor(http: HttpClient,
                @Optional() @Inject(PLATFORM_ID) platid?: Object,
                @Optional() @Inject(RELEASE_INFO) relInfo?: ReleaseInfo,
                @Optional() @Inject(CONFIG_URL) configUrl?: string)
    {
        super(http, relInfo, configUrl);
        if (platid)
            this.isOnServer = isPlatformServer(platid);
    }

    protected _useServerSide(cfgdata : LPSConfig) {
        cfgdata = deepCopy(cfgdata);
        if (cfgdata['PDRAPIs'] && cfgdata['PDRAPIs']['serverSide']) {
            cfgdata['PDRAPIs'] = { ...cfgdata['PDRAPIs'], ...cfgdata['PDRAPIs']['serverSide'] };
            delete cfgdata['PDRAPIs']['serverSide'];
        }
        return cfgdata;
    }

    protected _hideServerSide(cfgdata : LPSConfig) {
        cfgdata = deepCopy(cfgdata);
        if (cfgdata['PDRAPIs'] && cfgdata['PDRAPIs']['serverSide'])
            delete cfgdata['PDRAPIs']['serverSide'];
        return cfgdata;
    }

    loadConfig(data: any): void {
        super.loadConfig(data);
        if (this.isOnServer) {
            this.config = this._useServerSide(this.config as LPSConfig);
        } else {
            this.config = this._hideServerSide(this.config as LPSConfig);
        }
        this.inferMissingValues();
    }

    /**
     * fill in missing config values based on those that were given.  This mainly manipulates 
     * URLs
     */
    protected inferMissingValues(): void {
        let cfg: LPSConfig = this.config as LPSConfig;
        
        // set the default locations URLs
        if (! cfg.links.portalBase) {
            cfg.links.portalBase = cfg.links.orgHome;
            if (! cfg.links.portalBase.endsWith('/'))
                cfg.links.portalBase += '/';
            cfg.links.portalBase += 'data/';
        }

        if (! cfg.links.pdrHome)
            cfg.links.pdrHome = cfg.links.portalBase + "pdr/";
        if (! cfg.links.pdrSearch)
            cfg.links.pdrSearch = cfg.links.portalBase + "sdp/";
        if (! cfg.links.distService)
            cfg.links.distService = cfg.links.portalBase + "od/ds/";
        if (! cfg.links.pdrIDResolver)
            cfg.links.pdrIDResolver = cfg.links.portalBase + "od/id/";
        if (! cfg.links.nerdmAbout)
            cfg.links.nerdmAbout = cfg.links.portalBase + "od/dm/nerdm/";
        if (! cfg.links.homeURL)
            cfg.links.homeURL = cfg.links.portalBase;

        if (! cfg.PDRAPIs)
            cfg.PDRAPIs = {}
        if (!cfg.PDRAPIs.mdSearch)
            cfg.PDRAPIs.mdSearch = cfg.links.portalBase + "rmm/";
        if (! cfg.PDRAPIs.mdService)
            cfg.PDRAPIs.mdService = cfg.links.pdrIDResolver;
        if (! cfg.PDRAPIs.distService)
            cfg.PDRAPIs.distService = cfg.links.distService;
        if (! cfg.PDRAPIs.metrics)
            cfg.PDRAPIs.metrics = cfg.PDRAPIs.mdSearch + "usagemetrics/";
        if (! cfg.PDRAPIs.rpaBackend)
            cfg.PDRAPIs.rpaBackend = cfg.links.portalBase + "rpa/"
    }
}

/**
 * create a deep copy of an object
 */
export function deepCopy(obj) {
    // this implementation comes courtesy of and with thanks to Steve Fenton via
    // https://stackoverflow.com/questions/28150967/typescript-cloning-object/42758108
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }
 
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

