import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
    readonly endpoint : string = "http://localhost:9091/midas/";
    readonly saveapi : string = "dap/mdsx";
    resid: string = "1234";
    token: string = "fake token"

    // constructor(private resid : string, private endpoint : string, private token : string, private httpcli : HttpClient) { }

    constructor(private httpcli: HttpClient) { }

    public updateMetadata(md : Object) : Observable<any> {
        // To transform the output with proper error handling, we wrap the
        // HttpClient.patch() Observable with our own Observable
        // //
        // return of({"id":"12345"});
        let url = this.endpoint + this.saveapi;
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
