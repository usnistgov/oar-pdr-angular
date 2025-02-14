import { isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import * as rxjsop from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as fs from 'fs';
import * as proc from 'process';

import { AppConfig } from '../config/config';
import { NerdmRes, MetadataTransfer  } from './nerdm';
import * as errors from '../errors/error';
// import * as ngenv from '../../environments/environment';
import { IEnvironment } from '../../environments/ienvironment';

/**
 * a service that will retrieve a NERDm record.  Its behavior will depend on the 
 * runtime context.
 */
export abstract class NERDmResourceService {

    /**
     * retrieve the NERDm Resource record having the given ID
     * 
     * @param id        the NERDm record's identifier
     * @return Observable<NerdmRes>    an Observable that will resolve to a NERDm record
     */
    abstract getResource(id : string) : Observable<NerdmRes>;
}

/**
 * A mixin interface for a metadata service that retrieves its data from a remote web service which may 
 * require an authentication token to do so.  
 */
export interface SupportsAuthentication {
    /**
     * an authentication token that should be used to authenticate to the remote web service.
     * <p>
     * If this value is non-null, an implememtation should include this token in request to the 
     * remote service.  This is typically sent as a "Bearer" token in an HTTP Authorization header.
     * If null, the metadata service should assume that the remote service does not require an
     * authentication token.
     */
    authToken: string|null;
}

/**
 * A Metadata service that wraps another service and which will cache its results
 */
export class CachingNERDmResourceService extends NERDmResourceService {

    private del : NERDmResourceService;

    constructor(delegate : NERDmResourceService, protected cache? : MetadataTransfer) {
        super();
        this.del = delegate;
        if (! this.cache)
            this.cache = new MetadataTransfer();
    }

    cacheRecord(id : string, data : NerdmRes) : void {
        this.cache.set(id, data);
    }

    queryCache(id : string) : NerdmRes {
        return this.cache.get(id) as NerdmRes;
    }

    getResource(id : string) : Observable<NerdmRes> {
        let rec : NerdmRes = this.queryCache(id);
        if (rec !== undefined) 
            return rxjs.of(rec);

        let out$ = this.del.getResource(id);
        out$.subscribe(
            (rcrd) => { this.cacheRecord(id, rcrd.data); },
            (err) => {
                if (err instanceof errors.IDNotFound)
                    this.cacheRecord(id, null);
                return rxjs.throwError(err);
            }
        )
        return out$;
    }
}

/**
 * A NERDmResourceService that loads its metadata from a file on disk.  This implementation
 * is provided mainly for testing use of the NERDmResourceService on the server side.  It reads 
 * the metadata from files from a directory specified at construction.  Each file has a name 
 * of the form, _id_`.json`.  
 */
export class ServerDiskCacheResourceService extends NERDmResourceService {

    /**
     * create the service.  
     * 
     * @param cachedir    the directory containing NERDm resource record files
     */
    constructor(private cachedir : string) { super(); }

    /**
     * retrieve the NERDm Resource record having the given ID
     *
     * This implementation will also cache the loaded metadata to the MetadataTransfer 
     * instance (if provided at construction) for transfer to the client.
     * 
     * @param id   the identifier of the resource to load
     */
    getResource(id : string) : Observable<NerdmRes> {
        let file : string = this.cachedir + "/" + id + ".json";
        console.log("Reading NERDm record from local file: "+file);

        return new Observable<NerdmRes>((observer) => {
            if (! fs.existsSync(file)) {
                // ID does not exist
                observer.next(null);
                observer.complete();
                return;
            }
            
            if (! fs.statSync(file).isFile()) {
                observer.error(new Error(file + ": Not a file"));
                observer.complete();
                return;
            }

            fs.readFile(file, 'utf8', (err, data) => {
                if (err) 
                    observer.error(err);
                else {
                    try {
                        observer.next(JSON.parse(data).data);
                    } catch (e) {
                        observer.error(new Error(file + ": " + e.message));
                    }
                }
                observer.complete();
            });
        });
    }
}

/**
 * a NERDmResourceService that pulls its data from a MetadataTransfer instance.
 *
 * This is intended for browser-side metadata retrieval in which the MetadataTransfer 
 * instance has the metadata loaded from script elements in the downloaded web page.  
 */
export class TransferResourceService extends NERDmResourceService {

    /**
     * initialize the service with the MetadataTransfer cache to draw records from
     */
    constructor(private mdtrx : MetadataTransfer) { super(); }

    /**
     * retrieve the NERDm Resource record having the given ID
     *
     * This implementation will also cache the loaded metadata to the MetadataTransfer 
     * instance (if provided at construction) for transfer to the client.
     * 
     * @param id   the identifier of the resource to load
     */
    getResource(id : string) : Observable<NerdmRes> {
        return rxjs.of(this.mdtrx.get(id) as NerdmRes);
    }
}

/**
 * a NERDmResourceService that retrieves its records from a metadata web service.  This 
 * assumes the PDR resolver service (REST) interface for retrieving resources in which the 
 * identifier is appended to the base service endpoint URL.
 */
export class RemoteWebResourceService extends NERDmResourceService implements SupportsAuthentication  {

    authToken: string|null = null;

    /**
     * initialize the service with the metadata web service endpoint.
     * 
     * @param endpoint   the web service endpoint to use.  This implementation will form 
     *                     a retrieval URL by directly appending the desired ID.  No delimiting
     *                     slash will be inserted, so the endpoint should include one already
     *                     if appropriate.  
     */
    constructor(private endpoint : string,
                private webclient : HttpClient,
                authToken : string = null)
    {
        super();
        this.authToken = authToken;
    }

    /**
     * retrieve the metadata associated with the current identifier.
     *
     * @param id   the identifier of the resource to load
     */
    getResource(id : string) : Observable<NerdmRes> {
        let url = this.endpoint;
        if (! url.includes('?') && ! url.endsWith('/'))
            url += '/';
        url += id;
        
        let hdrs = { "Accept": "application/json" };
        if (this.authToken)
            hdrs['Authorization'] = "Bearer " + this.authToken;

        return this.webclient.get(url, {headers: hdrs}).pipe(
            rxjs.catchError(err => {
                let msg = err.message || err.statusText;
                if (err.status) {
                    if (err.status == 404)
                        throw new errors.IDNotFound(id, err);
                    if (err.status == 401)
                        throw new errors.NotAuthorizedError(id, "access", err);
                    if (err.status > 500)
                        throw new errors.ServerError(msg || "Unknown Server Error", err);
                    else 
                        throw new errors.OARError("Unexpected resolver response: " + msg +" (" +
                                                  err.status + ")", err);
                }
                else if (err.status == 0) 
                    throw new errors.CommError("Unexpected communication error: "+msg, url, err);
                else
                    throw new errors.OARError("Unexected error during retrieval from URL (" + 
                                              url + "): " + err.toString(), err);
            })
        ) as Observable<NerdmRes>;
    }
}

/**
 * a NERDmResourceService that retrieves its records from the RMM web service.  With the use 
 * of the PDR resolver service as preferred, this implementation is deprecated and kept only 
 * for historical purposes.
 */
export class RMMResourceService extends NERDmResourceService {

    /**
     * initialize the service with the metadata web service endpoint.
     * 
     * @param endpoint   the web service endpoint to use.  This implementation will form 
     *                     a retrieval URL by directly appending the desired ID.  No delimiting
     *                     slash will be inserted, so the endpoint should include one already
     *                     if appropriate.  
     */
    constructor(private endpoint : string,
                private webclient : HttpClient)
    { super(); }

    /**
     * retrieve the metadata associated with the current identifier.
     *
     * @param id   the identifier of the resource to load
     */
    getResource(id : string) : Observable<NerdmRes> {
        let url = this.endpoint;
        if (id.startsWith("ark:/"))
            url += "?@id=";
        else if (id.startsWith("doi:"))
            url += "?doi=";
        if (! url.includes('?') && ! url.endsWith('/'))
            url += '/';
        url += id;
        console.log("Pulling NERDm record from the RMM service via: " + url);

        let out = this.webclient.get(url) as Observable<NerdmRes>;
        return out.pipe(
            rxjsop.map<NerdmRes, NerdmRes>(data => {
                // strip out MongoDb search artifacts
                if (data.hasOwnProperty("ResultData")) {
                    // search result
                    if (data.ResultData.length == 0)
                        return null;
                    data = data.ResultData[0];
                }
                if (data.hasOwnProperty("_id") && data["_id"].hasOwnProperty("timestamp"))
                    delete data["_id"];
                return data;
            }),
            rxjsop.catchError(err => {
                // this will get handled by our global error handler
                if (err.status == 404) 
                    return rxjs.throwError(new errors.IDNotFound(id));
                return rxjs.throwError(err);
            })
        );
    }

    /**
     * instantiate a caching version of this service.  
     */
    static withCaching(endpoint : string, webclient : HttpClient)
        : CachingNERDmResourceService
    {
        return new CachingNERDmResourceService(new RemoteWebResourceService(endpoint, webclient));
    }
}

/**
 * A Metadata service that wraps another service and which will transmit metadata 
 * records requested on the server down to the browser.  
 */
export class TransmittingResourceService extends CachingNERDmResourceService {

    constructor(delegate : NERDmResourceService, mdtrx : MetadataTransfer) {
        super(delegate, mdtrx);
    }
}

/**
 * A Metadata service that accesses test NERDm records stashed in the angular environment
 * property, `testdata`.  
 */
export class AngularEnvironmentResourceService extends NERDmResourceService {
    ngenv: IEnvironment;

    constructor( ngenv: IEnvironment ) {
        super();

        this.ngenv = ngenv;

        if (! ngenv.testdata)
            throw new Error("No test data encoded into angular environment");
        if (Object.keys(ngenv.testdata).length <= 0)
            console.warn("No NERDm records included in the angular environment");
        
        console.log("Loading NERDm records from angular environment; available record ids: ")
        let idmsg : string = "  "
        for(let key of Object.keys(ngenv.testdata)) {
            idmsg += key + " "
        }
        console.log(idmsg);
    }

    /**
     * retrieve the metadata associated with the current identifier
     * 
     * @param id        the NERDm record's identifier
     * @return Observable<NerdmRes>    an Observable that will resolve to a NERDm record
     */
    getResource(id : string) : Observable<NerdmRes> {
        return rxjs.of(this.ngenv.testdata[id]);
    }
}

/**
 * create a NERDmResourceService based on the runtime context
 * 
 * @param platid     the PLATFORM_ID for determining if we are running on the server
 * @param endpoint   the base URL for the metadata web service.  The retrieval URL is 
 *                   formed by appending the ID of the desired resource.
 * @param httpClient the HttpClient interface to use to retrieve metadata.
 * @param mdtrx      (optional) the MetadataTransfer object that should be used to transmit
 *                   metadata records from the server to the browser.  If not provided 
 *                   (on the server side), none of the requested records will be transmitted.  
 */
export function createResourceService(ngenv: IEnvironment, platid : Object, endpoint : string, 
                                      httpClient : HttpClient, mdtrx? : MetadataTransfer)
{
    // Note: this implementation is based on the assumption that the app only needs one
    // NERDm record--the one for the resource being displayed.  If that assumption is no
    // longer true, this implementation should be changed (which would not be hard).

    let svc : NERDmResourceService|null = null
    if (isPlatformServer(platid)) {
        if (proc.env["PDR_METADATA_DIR"]) {
            // we're in a server-side development mode
            console.log("Will load NERDm records from directory cache: " +
                        proc.env["PDR_METADATA_DIR"]);
            svc = new ServerDiskCacheResourceService(proc.env["PDR_METADATA_DIR"]);
        }
        else {
            // we're in a server-side production-like mode:  get the records from
            // the web service and transmit them to the browser
            console.log("Will load NERDm records from remote web service: " + endpoint);
            svc = new RemoteWebResourceService(endpoint, httpClient);
        }
        if (mdtrx) {
            // don't need a cache for this context; just plug in the MetadataTransfer
            console.log("  (...and transfer them to the browser via embeded JSON)");
            return new TransmittingResourceService(svc, mdtrx);
        }
    }
    else if (mdtrx && mdtrx.labels().length > 0) {
        // we're in the browser and the web page contains an embedded record;
        // rely on the MetadataTransfer exclusively
        console.log("Will attempt to load NERDm record from embedded JSON");
        return new TransferResourceService(mdtrx);
    }
    else if (ngenv.context['useResourceService']) {
        console.log("Will load NERDm records from remote web service: " + endpoint);
        svc = new RemoteWebResourceService(endpoint, httpClient);
    }
    else {
        console.log("Will use test NERDm records from the angular environment.");
        return new AngularEnvironmentResourceService(ngenv);
    }

    return new CachingNERDmResourceService(svc);
}


