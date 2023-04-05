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

/**
 * Service responsible for providing configuration data for the application.
 * It loads the configuration from a given file and provides access to it
 * throughout the app.
 */
@Injectable(
    { providedIn: 'root' }
)
export class ConfigurationService {

    configUrl = 'assets/datasets.yaml';
    countriesUrl = 'assets/countries.json';
    secrestsUrl = 'assets/secrets.json';
    secrets: Secrets;

    constructor(private http: HttpClient) {
        this.configUrl = environment.configUrl;
        this.countriesUrl = environment.countriesUrl;
        this.secrestsUrl = environment.secretsUrl;
    }

    /**
     * Get the configuration object from the config URL.
     * @returns An observable containing the configuration object.
     */
    public getConfig(): Observable<any> {
        return this.http.get<any>(this.configUrl);
    }

    /**
     * Get the list of datasets from the configuration object.
     * @returns An observable containing the list of datasets.
     */
    public getDatasets(): Observable<Dataset[]> {
        const subject = new Subject<Dataset[]>();


        // parse the YAML file and extract the datasets
        this.http.get(this.configUrl, { responseType: 'text' }).subscribe(response => {
            const config = parse(response);
            subject.next(config.datasets);
        });

        return subject.asObservable();
    }

    /**
     * Get the form template with the specified name from the configuration object.
     * @param formName The name of the form template.
     * @returns An observable containing the form template.
     */
    public getFormTemplate(formName: string): Observable<FormTemplate> {
        const subject = new Subject<FormTemplate>();

        // parse the YAML file and extract the matching form template
        this.http.get(this.configUrl, { responseType: 'text' }).subscribe(response => {
            const config = parse(response);
            const matchingTemplate = config.formTemplates.find(template => template.id === formName);
            subject.next(matchingTemplate);
        });

        return subject.asObservable();
    }

    /**
     * Get the list of countries from the countries JSON file.
     * @returns An observable containing the list of countries.
     */
    public getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(this.countriesUrl).pipe(catchError(this.handleError));
    }

     /**
     * Load the secrets object from the specified file.
     * @param secretsFile The file path of the secrets object.
     * @returns An observable containing the secrets object.
     */
     public loadSecrets(secretsUrl: string): Observable<Secrets> {
        return this.http.get<Secrets>(secretsUrl).pipe(catchError(this.handleError));
    }

    /**
     * Handle the HTTP errors.
     * @param error The error object.
     * @returns An observable containing the error message.
     */
    private handleError(error: any) {
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



