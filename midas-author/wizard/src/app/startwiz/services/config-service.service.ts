import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import environment from '../../../assets/environment.json';
import { isPlatformBrowser } from '@angular/common';
// import process from 'process';

declare var require: any

const process = require('process');

export interface Config {
    MIDASAPI: string;
    LANDING: string
    PDRAPI: string;
    GACODE: string;
    APPVERSION: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfig {
    private appConfig: any;
    private confCall: any;
    private envVariables = "assets/environment.json";
    private confValues = {} as Config;

    constructor(private http: HttpClient, @Inject(PLATFORM_ID)
                private platformId: Object
    ) { }

    loadAppConfig() {
        if (isPlatformBrowser(this.platformId)) {

            // set this.envVariables to be the full URL for retrieving
            // configuration.  Normal rules of relative URLs are applied.    
            let baseurl = null;
            if (this.envVariables.startsWith("/")) {
                baseurl = location.origin;
            }
            else {
                baseurl = location.href.replace(/#.*$/, "");
                if (! this.envVariables.endsWith("/"))
                    baseurl = baseurl.replace(/\/[^\/]+$/, "/");
            }
            this.envVariables = baseurl + this.envVariables;
        //   console.log("Retrieving configuration from "+this.envVariables);
            
            this.confCall = this.http.get(this.envVariables)
            .toPromise()
            .then(
                resp => {
                // resp as Config;
                this.confValues.MIDASAPI = (resp as Config)['MIDASAPI'];
                this.confValues.LANDING = (resp as Config)['LANDING'];
                this.confValues.PDRAPI = (resp as Config)['PDRAPI'];
                this.confValues.GACODE = (resp as Config)['GACODE'];
                this.confValues.APPVERSION = (resp as Config)['APPVERSION'];
                // console.log("In Browser read environment variables: " + JSON.stringify(this.confValues));
                },
                err => {
                console.log("ERROR IN CONFIG :" + JSON.stringify(err));
                }
            );
            return this.confCall;
        } else {

            this.appConfig = <any>environment;
            this.confValues.MIDASAPI = process.env['MIDASAPI'] || this.appConfig.MIDASAPI;
            this.confValues.LANDING = process.env['LANDING'] || this.appConfig.LANDING;
            this.confValues.PDRAPI = process.env['PDRAPI'] || this.appConfig.PDRAPI;
            this.confValues.GACODE = process.env['GACODE'] || this.appConfig.GACODE;
            this.confValues.APPVERSION = process.env['APPVERSION'] || this.appConfig.APPVERSION;
            console.log(" ****** In server: " + JSON.stringify(this.confValues));
        }
    }

    getConfig() {
    // console.log(" ****** In Browser 3: "+ JSON.stringify(this.confValues));
        return this.confValues;
    }

    loadConfigForTest(){
        this.confValues = {
            "MIDASAPI":  "http://localhost:9091/midas/",
            "PDRAPI":  "https://localhost:4200/od/id/",
            "LANDING": "https://data.nist.gov/rmm/",
            "GACODE":  "not-set",
            "APPVERSION": "1.3.0"
        };
    }    
}
