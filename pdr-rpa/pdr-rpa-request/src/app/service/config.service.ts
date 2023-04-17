import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { parse } from 'yaml';
import { Observable, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Country } from "../model/country.model";
import { FormTemplate } from "../model/form-template.model";
import { Dataset } from "../model/dataset.model";
import { Configuration } from "../model/config.model";
import { environment } from "../../environments/environment";

/**
 * Service responsible for providing configuration data for the application.
 * It loads the configuration from a given file and provides access to it
 * throughout the app.
 */
@Injectable()
export class ConfigurationService {

    datasetsConfigUrl = 'assets/datasets.yaml';
    countriesUrl = 'assets/countries.json';
    configUrl = 'assets/config.json';
    config : Configuration = null;

    constructor(private http: HttpClient) {
        this.datasetsConfigUrl = environment.datasetsConfigUrl;
        this.configUrl = environment.configUrl;
        this.countriesUrl = environment.countriesUrl;
    }

    loadConfig(data: any) : void {
        this.config = data as Configuration;
        console.log("app configuration loaded");
    }

    /**
     * Get the configuration object from the config URL.
     * @returns An observable containing the configuration object.
     */
    public fetchConfig(configURL: string = null): Observable<any> {
        if (! configURL)
            configURL = this.configUrl;
        return this.http.get<Configuration>(configURL, {responseType: "json"}).pipe(
            catchError(this.handleError)
        ).pipe( tap(cfg => (this.loadConfig(cfg))) );
    }

    /**
     * return the (already loaded) configuration data.  It is expected that when this 
     * method is call that the configuration was already fetched (via fetchConfg()) at 
     * application start-up.  
     */
    public getConfig(): Configuration {
        if (! this.config) 
            return { baseUrl: "/", recaptchaApiKey: "" } as Configuration;
        return this.config;
    }

    /**
     * Get the list of datasets from the configuration object.
     * @returns An observable containing the list of datasets.
     */
    public getDatasets(): Observable<Dataset[]> {
        const subject = new Subject<Dataset[]>();


        // parse the YAML file and extract the datasets
        this.http.get(this.datasetsConfigUrl, { responseType: 'text' }).subscribe(response => {
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
        this.http.get(this.datasetsConfigUrl, { responseType: 'text' }).subscribe(response => {
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



