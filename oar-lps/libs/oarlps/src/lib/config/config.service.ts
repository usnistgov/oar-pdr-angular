import { Inject, InjectionToken } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as proc from 'process';
import * as fs from 'fs';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppConfig, LPSConfig } from './config';
import * as ngenv from '../../environments/environment';

export const CONFIG_KEY_NAME : string = "LPSConfig";
export const CONFIG_TS_KEY : StateKey<AppConfig> = makeStateKey(CONFIG_KEY_NAME);
export const CFG_DATA : InjectionToken<LPSConfig> = new InjectionToken<LPSConfig>("lpsconfig");
import { IEnvironment } from '../../environments/ienvironment';
import * as env from '../../environments/environment';

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

/**
 * a service that will create an AppConfig instance loaded with values 
 * approriate for the runtime context.
 */
export abstract class ConfigService {

    /**
     * return an AppConfig instance that is appropriate for the runtime 
     * context.
     */
    abstract getConfig() : AppConfig; 
    
}

/**
 * A ConfigService that pulls it data from a remote URL
 * 
 * This service is intended for use in production mode when running 
 * client-only in the browser.  
 */
export class RemoteFileConfigService extends ConfigService {
    private source : string = "remote-file";
    private defMode : string = "prod";
    private config : AppConfig|null = null;

    /**
     * construct the service
     * @param endpoint  the remote endpoint to retrieve the JSON-encoded configuration from.
     *                  This can be given as a relative URL.
     */
    constructor(private endpoint: string, private httpClient: HttpClient, prefetch: boolean = true) {
        super();
        console.log("Will load configuration data from remote file ("+this.endpoint+")");
    }

    /**
     * load the AppConfig with the given data
     */
    load(data: any) : void {
        this.config = new AppConfig(data as LPSConfig);
        this.config["source"] = this.source;
        this.config["ready"] = true;
        if (! this.config["env"])
            this.config["env"] = this.defMode;
        console.log("Remote configuration loaded for env="+this.config["env"])
    }

    /**
     * fetch and load the configuration data so that it is ready for retrieval
     */
    fetch(http: HttpClient, endpoint: string = null) : Observable<any> {
        if (! endpoint)
            endpoint = this.endpoint;

        return this.httpClient.get<any>(endpoint, {responseType: 'json'}).pipe(
            catchError(this._handleFetchError)
        ).pipe( tap(cfg => (this.load(cfg))) );
    }

    private _handleFetchError(error: HttpErrorResponse) {
        if (error.status === 0) {
            // A client-side or network error occurred.
            console.error('Error connecting for configuration: ', error.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(`Server error ${error.status} while retrieving configuration: `, error.error)
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Failed to retrieve configuration from server (see console)'));
    }

    /**
     * return an AppConfig instance that is appropriate for the runtime 
     * context.  This will asynchronously return an AppConfig rather than a 
     * Promise.  
     */
    getConfig() : AppConfig {
        if (! this.config)
            // this shouldn't happen
            return new AppConfig({
                source: "remote-pending",
                locations: { orgHome: "" },
                ready: false
            } as LPSConfig);

        return this.config;
    }
}

/**
 * A ConfigService that pulls it data from the environmental context
 * that Angular builds into the app.  
 * 
 * This service is intended for use in development mode running either as 
 * client-only in the browser or on the server.  
 */
export class AngularEnvironmentConfigService extends ConfigService {
    private source : string = "angular-env";
    private defMode : string = "dev";
    private config : AppConfig|null = null;
    private ngenv : IEnvironment;

    /**
     * construct the service
     * @param platid   the PLATFORM_ID value for determining if we are running on the server
     *                 or in the browser.
     * @param cache    the TransferState instance for the application.  If we are on the server,
     *                 getConfig() will cache the configuration to the TransferState object.
     */
    constructor(private ienv : IEnvironment,
                private platid : object, 
                private cache : TransferState)
    {
        super();
        if(!ienv){
            ienv = {} as IEnvironment;
            ienv.config = env.config;
            ienv.context = env.context;
            ienv.testdata = env.testdata;
        }
        this.ngenv = ienv;
    }

    /**
     * return an AppConfig instance that is appropriate for the runtime 
     * context.  This will asynchronously return an AppConfig rather than a 
     * Promise.  
     */
    getConfig() : AppConfig {
        if (! this.config) {
            console.log("Loading development-mode configuration data from the Angular built-in environment");
            let data : LPSConfig = deepCopy(this.ngenv.config);
            let out : AppConfig = new AppConfig(data);
            out["source"] = this.source;
            if (! out["env"]) 
                out["env"] = this.defMode;

            if (isPlatformServer(this.platid))
                this.cache.set<AppConfig>(CONFIG_TS_KEY, out);
            this.config = out;
        }
        return this.config;
    }
}

/**
 * a ConfigService that reads in its data from a file on local disk.  
 * 
 * This will only work on the server.  The data is read in from a given
 * JSON-formatted file specified at construction.
 * 
 * This service is intended for when the LPS is running in a docker container 
 * from oar-docker.  The container launch script pulls configuration from the
 * config-server and writes it to a file.
 */
export class ServerFileConfigService extends ConfigService {

    private source : string = "server-file";
    private defMode : string = "prod";       // i.e. in the docker context
    private config : AppConfig|null = null;

    /**
     * construct the service.  
     * 
     * @param cfgfile   the (full) path to the file to read JSON-encoded data from
     * @throw Error -- if cfgfile is not set or does not point to an existing file.  
     */
    constructor(private cfgfile : string, private cache? : TransferState) {
        super();
        if (! cfgfile)
            throw new Error("Configuration file not provided");
        if (! fs.existsSync(cfgfile))
            throw new Error(cfgfile + ": File not found");
        if (! fs.statSync(cfgfile).isFile())
            throw new Error(cfgfile + ": Not a file");
    }

    /**
     * return an AppConfig instance that is appropriate for the runtime 
     * context.  This implementation reads the config data from a JSON file. 
     */
    getConfig() : AppConfig {
        if (this.config)
            return this.config;  // previously created AppConfig

        console.log("Loading configuration data from " + this.cfgfile);

        // synchronous read.  (The file is typically short.)
        let out : LPSConfig = JSON.parse(fs.readFileSync(this.cfgfile, 'utf8'));
        out["source"] = this.source;
        if (! out["mode"])
            out["mode"] = this.defMode;

        this.config = new AppConfig(out);
        if (this.cache)
            this.cache.set<AppConfig>(CONFIG_TS_KEY, this.config);
        return this.config;
    }
}

/**
 * a server-side ConfigService that provides data that was loaded in when the 
 * server started. 
 */
export class ServerLoadedConfigService extends ConfigService {
    private config : AppConfig|null = null;

    constructor(private cfgdata : LPSConfig, private cache? : TransferState) {
        super();
        if (! cfgdata)
            throw new Error("Server failed to load config data");
    }

    /**
     * return an AppConfig instance that is appropriate for the runtime context.  
     * This implementation loads that that was previously loaded by the server at 
     * start-up time.  
     */
    getConfig() : AppConfig {
        if (this.config)
            return this.config;  // previously created AppConfig

        console.log("Loading configuration data previously loaded by server");

        this.config = new AppConfig(this.cfgdata);
        if (this.cache)
            this.cache.set<AppConfig>(CONFIG_TS_KEY, this.config);
        return this.config;
    }
}

/**
 * a ConfigService that pulls in data the transfer state
 */
export class TransferStateConfigService extends ConfigService {

    private source : string = "transfer-state";
    private defMode : string = "prod";

    /**
     * create the service given a TransferState container
     */
    constructor(private cache : TransferState) {
        super();
        if (! cache.hasKey(CONFIG_TS_KEY))
            throw new Error("Config key not found in TransferState: " + CONFIG_KEY_NAME);
    }

    /**
     * return an AppConfig instance that is appropriate for the runtime 
     * context.  This implementation extracts the configuration data from 
     * the transfer state.
     */
    getConfig() : AppConfig {
        console.log("Loading configuration data delivered from the server.");

        let data : LPSConfig|null = this.cache.get<AppConfig>(CONFIG_TS_KEY, null) as LPSConfig;
        if (! data)
            throw new Error("Missing key from transfer state: " + CONFIG_KEY_NAME)
        data["source"] = this.source;
        if (! data["mode"])
            data["mode"] = this.defMode;
        return new AppConfig(data);
    }
}

/**
 * return ConfigService appropriate for current runtime context.
 * 
 * If the app is running in the user's browser, the service will look for 
 * the returned service will load configuration data from the app's the 
 * transfer state.  If it is not there, we can assume that 
 * we are running in development-client-only mode and 
 * retrieve the data from the built-in environment.  If the app is running 
 * on the server, we can retrieve the data from a local file whose path
 * is set in the OS environment variable (OAR_CONFIG_FILE).  If that is 
 * not set, we can assume we are running in development-server mode.
 *
 * @param platid    the PLATFORM_ID for determining if we are running on the server
 * @param cache     a TransferState instance to check for config data
 * @param cfgdata   (optional) LPSConfig object that contains the configuration data loaded 
 *                    explicitly by some other means.  (This hook is intended for future 
 *                    ways of loading the configuration data on the server.)
 */
export function newConfigService(ngenv: IEnvironment, platid : Object, cache : TransferState,
                                 httpcli?: HttpClient, cfgdata? : LPSConfig)
    : ConfigService
{
    if (cache.hasKey(CONFIG_TS_KEY))
        // this means we're on (should be) on the browser side
        return new TransferStateConfigService(cache);

    if (isPlatformServer(platid) && cfgdata)
        // this means we're on the server in production-like mode
        // this will stash the data into the TransferState
        return new ServerLoadedConfigService(cfgdata, cache);

    if (isPlatformServer(platid) && proc.env["PDR_CONFIG_FILE"])
        // this means we're on the server in production-like mode
        // this will stash the data into the TransferState
        return new ServerFileConfigService(proc.env["PDR_CONFIG_FILE"], cache);

    if (ngenv.context.configEndpoint)
        // this means that the configuration data should be retrieved from remote
        // URL that returns an LPSConfig object in JSON format
        return new RemoteFileConfigService(ngenv.context.configEndpoint, httpcli);

    // This is the default intended for a development context
    // this will stash the data into the TransferState
    return new AngularEnvironmentConfigService(ngenv, platid, cache);
}
