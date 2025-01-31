import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, Subscriber } from 'rxjs';

import { AppConfig } from '../../config/config';
import {
    CustomizationService, WebCustomizationService, InMemCustomizationService,
    SystemCustomizationError, ConnectionCustomizationError
} from './customization.service';
import { deepCopy } from '../../config/config.service';
import { IEnvironment } from '../../../environments/ienvironment';
import * as environment from '../../../environments/environment';
import { AuthenticationService, Credentials, UserAttributes, StaffDirectoryService } from 'oarng';

/**
 * A specialized Error indicating a error originating with from client action/inaction; the 
 * message is assumed to be one directed at the user (rather than the programmer) and can be 
 * displayed in the application in some way.
 */
class ClientError extends Error {
    constructor(msg: string) {
      super(msg);
      Object.setPrototypeOf(this, ClientError.prototype);
    }
}

export abstract class AuthService {
    protected _creds: Credentials|null = null;

    /**
     * the full set of user information obtained via the log-in process
     */
    get userAttributes() { return this._creds.userAttributes; }

    /**
     * the user ID that the current authorization has been granted to.
     */
    get userID() { 
        if(this._creds)
            return this._creds.userId; 
        else    
            return null;
    }

    set userAttributes(userAttributes: UserAttributes) { 
        this._creds.userAttributes = deepCopy(userAttributes); 
    }

    set creds(creds: Credentials) {
        this._creds = deepCopy(creds);
    }

    /**
     * Store the error message returned from authorizeEditing
     */
    protected _errorMessage: string;

    set errorMessage(errMsg: string) { this._errorMessage = errMsg; }
    get errorMessage() { return this._errorMessage; }

    /**
     * construct the service
     */
    constructor() { }

    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
    public abstract isAuthorized(): boolean;

    /**
     * create a CustomizationService that allows the user to edit the resource metadata 
     * associated with the given ID.  Note that an implementation may need to redirect the browser 
     * to an authentication service to determine who the current user is.  
     *
     * @param resid     the identifier for the resource to edit
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  no user information is set and null is returned if the user is not logged in.  
     * @param Observable<CustomizationService>  an observable wrapped CustomizationService that should 
     *                  be used to send edits to the customization server.  The service will be null if 
     *                  the user is not authorized.  
     */
    public abstract authorizeEditing(resid: string, nologin?: boolean)
        : Observable<CustomizationService>;
}

/**
 * an implementation of the CustomizationService that caches metadata updates on the 
 * server via a web service.  
 *
 * This implementation is intended for use in production.  
 */
@Injectable({
    providedIn: 'root'
})
export class WebAuthService extends AuthService {

    private _endpoint: string = null;
    private _authtok: string = null;


    /**
     * the endpoint URL for the customization web service 
     */
    get endpoint() { return this._endpoint; }

    /**
     * the authorization token that gives the user permission to edit the resource metadata
     */
    get authToken() { 
        if(this._creds)
            return this._creds.token; 
        else
            return null;
    }

    /**
     * create the AuthService according to the given configuration
     * @param config  the current app configuration which provides the customization service endpoint.
     *                (this is normally provided by the root injector).
     * @param httpcli an HttpClient for communicating with the customization web service
     */
    constructor(config: AppConfig, 
                private httpcli: HttpClient,
                public authService: AuthenticationService,
                private sdsvc: StaffDirectoryService) {
        super();
        this._endpoint = config.get('mdAPI', '/customization/');
        if (!this._endpoint.endsWith('/')) this._endpoint += "/";
    }

    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
    public isAuthorized(): boolean {
        return Boolean(this.authToken);
    }

    /**
     * create a CustomizationService that allows the user to edit the resource metadata 
     * associated with the given ID.  If the CustomizationService returned through the 
     * Observable is null, the user is not authorized to edit.  
     *
     * Note that instead of returning, this method may redirect the browser to an authentication
     * server to authenticate the user.  
     * 
     * @param resid     the identifier for the resource to edit
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  no user information is set and null is returned if the user is not logged in.  
     */
    public authorizeEditing(resid: string, nologin: boolean = false): Observable<CustomizationService> {
        if (this.authToken)
            return of(new WebCustomizationService(resid, this.endpoint, this.authToken,
                this.httpcli, this.userID));

        // we need an authorization token
        return new Observable<CustomizationService>(subscriber => {
            this.authService.getCredentials().subscribe({
                next: (creds) =>{
                    this._creds = creds;
                    if (creds.token) {
                        this.sdsvc.setAuthToken(creds.token);
                        this._creds.token = creds.token;
                        // the user is authenticated and authorized to edit!
                        subscriber.next(
                            new WebCustomizationService(resid, this.endpoint, this.authToken,
                                this.httpcli, creds.userId)
                        );
                        subscriber.complete();
                    }
                    else if (creds.userId) {
                        // the user is authenticated but not authorized
                        this.errorMessage = creds.errorMessage;
                        subscriber.next(null);
                        subscriber.complete();
                    }
                    else {
                        // the user is not authenticated!
                        subscriber.next(null);
                        subscriber.complete();
                    }
                },
                error:(err) => {
                    subscriber.error(err);
                }
            })
        });
    }
}


/**
 * An AuthService intended for development and testing purposes which simulates interaction 
 * with a authorization service.
 */
@Injectable()
export class MockAuthService extends AuthService {
    private resdata: {} = {};

    /**
     * construct the authorization service
     *
     * @param resmd      the original resource metadata 
     * @param userid     the ID of the user; default "anon"
     */
    constructor(creds?: Credentials, ngenv2?: IEnvironment, private httpcli?: HttpClient) {
        super();
        if (creds === undefined) {
            this._creds = {
                userId: "anon",
                userAttributes: {
                    userName: "Anon",
                    userLastName: "Lee",
                    userEmail: "Anon.Lee@nist.gov"
                },
                token: 'fake jwt token'
            }
        }else{
            this._creds = creds;
        }

        if(ngenv2 == undefined){
            ngenv2 = environment;
        }
        
        if (!ngenv2.testdata)
            throw new Error("No test data encoded into angular environment");
        if (Object.keys(ngenv2.testdata).length < 0)
            console.warn("No NERDm records included in the angular environment");

        // load resource metadata lookup by ediid
        for (let key of Object.keys(ngenv2.testdata)) {
            if (ngenv2.testdata[key]['ediid'])
                this.resdata[ngenv2.testdata[key]['ediid']] = ngenv2.testdata[key];
        }
    }

    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
    public isAuthorized(): boolean {
        return Boolean(this._creds);
    }

    /**
     * create a CustomizationService that allows the user to edit the resource metadata 
     * associated with the given ID.
     *
     * @param resid     the identifier for the resource to edit
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  no user information is set and null is returned if the user is not logged in.  
     * @param Observable<CustomizationService>  an observable wrapped CustomizationService that should 
     *                  be used to send edits to the customization server.  The service will be null if 
     *                  the user is not authorized.  
     */
    public authorizeEditing(resid: string, nologin: boolean = false): Observable<CustomizationService> {
        // simulate logging in with a redirect 
        if (!this._creds){ 
          }
        if (!this.resdata[resid]){
            return of<CustomizationService>(null);
        }
        return of<CustomizationService>(new InMemCustomizationService(this.resdata[resid], this.httpcli));
    }
}

/**
 * create an AuthService based on the runtime context.
 * 
 * This factory function determines whether the application has access to a customization 
 * web service (e.g. in production mode under oar-docker).  In this case, it will return 
 * a AuthService configured to use the service.  In a development runtime context, where 
 * the app is running standalone without such access, a mock service is returned.  
 * 
 * Which type of AuthService is returned is determined by the value of 
 * context.useCustomizationService from the angular environment (i.e. 
 * src/environments/environment.ts).  A value of false assumes a develoment context.
 */
export function createAuthService(ngenv: IEnvironment, config: AppConfig, httpClient: HttpClient, authService: AuthenticationService, sdsvc: StaffDirectoryService, devmode?: boolean)
    : AuthService {

    if (devmode === undefined)
        devmode = Boolean(ngenv.context && ngenv.context['useCustomizationService']) === false;

    if (!devmode) {
        // production mode
        console.log("Will use configured customization web service");
        return new WebAuthService(config, httpClient, authService, sdsvc);
    }

    // dev mode
    if (!ngenv['context'])
        console.warn("Warning: angular environment is missing context data");
    console.log("Using mock AuthService/CustomizationService");
    return new MockAuthService(undefined, ngenv, httpClient);
}

