import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, Subscriber } from 'rxjs';
import { LPSConfig } from 'oarlps';
import { ConfigurationService } from 'oarng';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
    readonly saveapi : string = "dap/mds3";
    resid: string = "1234";
    token: string = "fake token"
    confValues: LPSConfig;
    private MIDASAPI: string;

    constructor(private httpcli: HttpClient,
        private configSvc: ConfigurationService) { 
                    this.confValues = this.configSvc.getConfig();
                    this.MIDASAPI = this.confValues['MIDASAPI'];
                }

    setToken(token: string){
        this.token = token;
    }

    public updateMetadata(md : Object) : Observable<any> {
        if(this.token == "") {
            let err = "You are not authorized to edit this record.";
            console.log(err);
            return new Observable<string>(subscriber=>{ subscriber.error(err)});
        } 

        let url = this.MIDASAPI + this.saveapi;
        let body = JSON.stringify(md);

        return this.httpcli.post(url, body, { headers: { "Authorization": "Bearer " + this.token } });
    }
}
