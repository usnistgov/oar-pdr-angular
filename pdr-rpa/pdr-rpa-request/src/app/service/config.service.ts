import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { parse } from 'yaml';
import { Observable, Subject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Country } from "../model/country.model";
import { FormTemplate } from "../model/form-template.model";
import { Dataset } from "../model/dataset.model";
import { Secrets } from "../model/secrets.model";
import { environment } from "../../environments/environment";


@Injectable(
    { providedIn: 'root' }
)
export class ConfigurationService {

    configUrl = 'assets/datasets.yaml';
    secrets: Secrets;

    constructor(private http: HttpClient) {
        this.configUrl = environment.configUrl;
    }

    public getConfig() {
        return this.http.get<any>(this.configUrl);
    }

    public getDatasets(): Observable<Dataset[]> {
        const subject = new Subject<Dataset[]>();

        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
        })

        this.http.get(this.configUrl, { responseType: 'text', headers: headers }).subscribe(response => {
            let config = parse(response);
            subject.next(config.datasets);
        });
        return subject.asObservable();

    }

    public getFormTemplate(formName: string): Observable<FormTemplate> {
        const subject = new Subject<FormTemplate>();

        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
        })

        this.http.get(this.configUrl, { responseType: 'text', headers: headers }).subscribe(response => {
            let config = parse(response);
            let matchingTemplate;
            config.formTemplates.forEach(template => {
                if (template.id === formName) {
                    matchingTemplate = template;
                }
            })
            subject.next(matchingTemplate);
        });
        return subject.asObservable();
    }

    public getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>('assets/countries.json').pipe(catchError(this.handleError));
    }

    public loadSecrets(secretsFile: string) {
        return this.http.get<Secrets>(secretsFile).pipe(catchError(this.handleError));
    }

    // Error handling
    public handleError(error: any) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        window.alert(errorMessage);
        return throwError(() => {
            return errorMessage;
        });
    }
}



