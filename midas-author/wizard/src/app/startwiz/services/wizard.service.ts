import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, Subscriber } from 'rxjs';
import { AppConfig, Config } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
    readonly saveapi : string = "dap/mds3";
    resid: string = "1234";
    token: string = "fake token"
    confValues: Config;
    private MIDASAPI: string;

    // constructor(private resid : string, private endpoint : string, private token : string, private httpcli : HttpClient) { }

    constructor(private httpcli: HttpClient,
                private appConfig: AppConfig) { 
                    this.confValues = this.appConfig.getConfig();
                    this.MIDASAPI = this.confValues.MIDASAPI;
                }

    public updateMetadata(md : Object) : Observable<any> {
        // To transform the output with proper error handling, we wrap the
        // HttpClient.patch() Observable with our own Observable
        // //
        // return of({"id":"12345"});
        let url = this.MIDASAPI + this.saveapi;
        let body = JSON.stringify(md);

        console.log("URL", url);
        console.log("body", body);

        return this.httpcli.post(url, body, { headers: { "Authorization": "Bearer " + this.token } });


        // return new Observable<Object>(subscriber => {
        //     let url = this.endpoint + this.saveapi + this.resid;
        //     let body = JSON.stringify(md);
        //     let obs : Observable<Object> = 
        //         this.httpcli.patch(url, body, { headers: { "Authorization": "Bearer " + this.token } });

        //     this._wrapRespObs(obs, subscriber);
        // });
    }
}
