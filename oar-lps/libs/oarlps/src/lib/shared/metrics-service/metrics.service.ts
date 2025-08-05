import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppConfig } from '../../config/config';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
    protected metricsEP: string|null = null;

    constructor(private http: HttpClient,
                private configSvc?: AppConfig) 
    { 
        // this.metricsBackend = cfg.get("PDRAPIs.metricsAPI", "/rmm/usagemetrics");
    }

    /**
     * the endpoint URL for the customization web service 
     */
    get endpoint(): string {
        if (! this.metricsEP && this.configSvc) {
            let ep: string = this.configSvc.get<string>("PDRAPIs.metrics", "/rmm/usagemetrics/");
            if (! ep)
                // perhaps configuration has not been resolved yet?
                throw new Error("Incomplete DAP service configuration: missing 'serviceEndpoint'");
    
            if (!ep.endsWith('/'))
                ep += '/'; 

            this.metricsEP = ep;
        }
        console.log("Metrics endpoint", this.metricsEP);
        return this.metricsEP;
    }

    getFileLevelMetrics(ediid: string): Observable<any> {
        let url = this.endpoint + "files/" + ediid;

        const request = new HttpRequest(
            "GET", url, 
            { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'responseType': 'blob' }), reportProgress: true, responseType: 'blob' });

        return this.http.request(request);
    }

    getRecordLevelMetrics(ediid: string): Observable<any> {
        let url = this.endpoint + "records/" + ediid;

        const request = new HttpRequest(
            "GET", url, 
            { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'responseType': 'blob' }), reportProgress: true, responseType: 'blob' });

        return this.http.request(request);
    }

    /**
     * Find a match of metrics data based on given ediid, pdrid and filepath. Ignore sha files.
     * @param fileLevelData File level metrics data returned from getFileLevelMetrics()
     * @param ediid ediid in nerdm record to find a match
     * @param pdrid pdrid in nerdm record to find a match
     * @param filepath filepath in nerdm record to find a match
     * @returns metrics data if a match found. Otherwise return null.
     */
    findFileLevelMatch(fileLevelData: any, ediid: string, pdrid: string, filepath: string) {
        if(!ediid || !pdrid || !filepath) return null;

        // Strip off 'ark:/88434/' if any
        let _ediid = ediid.replace('ark:/88434/', '');
        let _pdrid = pdrid.replace('ark:/88434/', '');
        let _filepath = filepath.trim();
        let ret: any = null;
        if(fileLevelData){
            if(_filepath) {
                if(filepath[0]=="/") _filepath = filepath.slice(1);
                _filepath = _filepath.trim();
            }

            //Check if we have multiple pdrids
            let hasMultiPdrid: boolean = false;
            let prevPdrid: string = null;
            for(let x of fileLevelData) {
                if(x.pdrid && x.pdrid.toLowerCase() != 'nan'){
                    if(!prevPdrid) {
                       prevPdrid = x.pdrid; 
                    } 
                    else if(prevPdrid != x.pdrid) {
                        hasMultiPdrid = true;
                        break;
                    }
                }
            }
            
            const filteredFileLevelData = fileLevelData.filter(x => {
                 return (x.ediid.replace('ark:/88434/', '') == _ediid && (x.filepath? x.filepath.trim()==_filepath : false) && !x.filepath.endsWith('sha256'))
            });

            for(let x of filteredFileLevelData) {
                if(hasMultiPdrid){
                    if(typeof x.pdrid == 'string' && x.pdrid.replace('ark:/88434/', '') == _pdrid.replace('ark:/88434/', '')) {
                        ret = x;
                        break;
                    }
                }else{
                    ret = x;
                    break; 
                }
            }
        }

        return ret;
    }    
}
