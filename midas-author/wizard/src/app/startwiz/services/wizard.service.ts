import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, Subscriber } from 'rxjs';
import { AppConfig } from 'oarlps';
import { ConfigurationService } from 'oarng';
import { CollectionDataModel } from '../models/data.model';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
    readonly saveapi : string = "dap/mds3";
    resid: string = "1234";
    token: string = "fake token"
    MIDASAPI: string;

    collectionData: CollectionDataModel[] = [
        {id: 1, displayName: "Additive Manufacturing", value: "AdditiveManufacturing"},
        {id: 2, displayName: "Chips Metrology (METIS)", value: "Metrology"},
        {id: 3, displayName: "Forensics", value: "Forensics"},
        {id: 4, displayName: "Do not add to any domain collection", value: "None"}
    ]

    constructor(private httpcli: HttpClient,
                private configSvc: AppConfig)
    {
        this.MIDASAPI = this.configSvc.get('dapEditing.serviceEndpont', "/midas/dap/mds3/");
    }

    setToken(token: string){
        this.token = token;
    }

    public getCollectionData(): CollectionDataModel[] {
        return this.collectionData;
    }

    public updateMetadata(md : Object) : Observable<Object> {
        if(this.token == "") {
            let err = "You are not authorized to edit this record.";
            console.error(err);
            return new Observable<Object>(subscriber=>{ subscriber.error(err)});
        }

        return new Observable<Object>(subscriber => {
          let url = this.MIDASAPI;
          let body = JSON.stringify(md);

          let obs : Observable<Object> =
              this.httpcli.post(url, body, { headers: { "Authorization": "Bearer " + this.token } });

          this._wrapRespObs(obs, subscriber);
        });
    }

    private _wrapRespObs(obs : Observable<Object>, subscriber : Subscriber<Object>) : void {
        obs.subscribe({
            next: (jsonbody) => {
                subscriber.next(jsonbody);
            },
            error: (httperr) => {   // this will be an HttpErrorResponse
                let msg = "";
                let err = null;

                if (httperr.status == 401) {
                    msg += "Authorization Error (401)";
                    // TODO: can we get at body of message when an error occurs?
                    // if (httperr.body['message']) msg += ": " + httperr.body['message'];
                    err = new AuthError(msg, httperr.status);
                }
                else if (httperr.status == 404) {
                    msg += "Record Not Found (404)"
                    // TODO: can we get at body of message when an error occurs?
                    // if (httperr.body['message']) msg += ": " + httperr.body['message'];
                    msg += " (Is the service endpoint correct?)"
                    err = new NotFoundError(msg, httperr.status);
                }
                else if (httperr.status < 100 && httperr.error) {
                    msg = httperr.error.message
                    err = new ConnectionError("Service connection error: "+msg)
                }
                else {
                    msg += "Unexpected Customization Error";
                    if (httperr.status > 0) msg += "(" + httperr.status.toString() + ")";
                    // TODO: can we get at body of message when an error occurs?
                    // if (httperr.body['message']) msg += ": " + httperr.body['message'];
                    err = new SystemError(msg, httperr.status);
                }
                subscriber.error(err);
            }
        });
    }
}

/**
 * an error interacting with the CustomizationService.  This serves as a base class
 * for different error types resulting from service interactions.
 */
export class CustomizationError {

    /**
     * a label identifying the type of error
     */
    private _type
    get type() { return this._type; }

    /**
     * create the error
     *
     * @param type     a label that idenfifies the type of the error (which parallels
     *                 the class type.
     * @param message  a description of the specific error
     * @param statusCode  a numerical qualifier for the particular error; this is used
     *                 to hold an HTTP status code which should be 0 no such service is
     *                 involved, and 1 when the attempt to connect to an underlying fails.
     *                 Other values less than 100 can be used for errors associated with
     *                 connecting to an underlying service that is not web-based.
     */
    constructor(type : string, public message : string, public statusCode : number = 0) {
        this._type = type;
    }
}

/**
 * an error that indicates a failure connecting to a remote service.
 * For example, this error would be raised if the remote service is down.  This
 * error would normally not be raised if the service is up and capable of returning
 * an error response.
 */
export class ConnectionError extends CustomizationError {

    /**
     * create the error instance
     */
    constructor(message : string) {
        super("conn", message, 1);
    }
}

/**
 * an error that indicates an authorization failure, including attempting
 * to update metadata without authentication or authorization.  In particular, this
 * error should be raised if an authorization credential times out.
 */
export class AuthError extends CustomizationError {

    /**
     * create the error instance
     */
    constructor(message : string, statusCode = 401) {
        super("auth", message, statusCode);
    }
}

/**
 * an error reflecting an unexpected condition or result while
 * using the CustomizationService.
 */
export class SystemError extends CustomizationError {

    /**
     * create the error instance
     */
    constructor(message : string, statusCode = 2) {
        super("sys", message, statusCode);
    }
}

/**
 * an error that is a result of a incorrect user action or input.  The error message
 * should be instructive to a user about what was done incorrectly.
 */
export class UserInputError extends CustomizationError {

    /**
     * create the error instance
     */
    constructor(message : string, statusCode = 3) {
        super("user", message, statusCode);
    }
}

/**
 * an error that indicates that the metadata record cannot be found using the handle
 * provided.  This reflect either a non-existent identifier or an incorrect service endpoint.
 */
export class NotFoundError extends CustomizationError {

    /**
     * create the error instance
     */
    constructor(message : string, statusCode = 4) {
        super("notfound", message, statusCode);
    }
}
