import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { parse } from 'yaml';
import { BehaviorSubject, Observable, Subject, of, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
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
@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {

    datasetsConfigUrl = 'assets/datasets.yaml';
    countriesUrl = 'assets/countries.json';
    configUrl = 'assets/config.json';
    config: Configuration | null = null;

    private configSubject = new BehaviorSubject<Configuration>({ baseUrl: '/', recaptchaApiKey: '' });

    constructor(private http: HttpClient) {
        this.datasetsConfigUrl = environment.datasetsConfigUrl;
        this.configUrl = environment.configUrl;
        this.countriesUrl = environment.countriesUrl;
    }

    loadConfig(data: any): void {
        this.config = data as Configuration;
        if (environment.debug) console.log("app configuration loaded. ", this.config);
    }

    /**
     * Get the configuration object from the config URL.
     * @returns An observable containing the configuration object.
     */
    public fetchConfig(configURL: string | null = null): Observable<any> {
        if (environment.debug) console.log("fetching configuration using http");
        if (!configURL)
            configURL = this.configUrl;
        return this.http.get<Configuration>(configURL, { responseType: "json" }).pipe(
            catchError(this.handleError),
            tap(cfg => {
                this.config = cfg as Configuration;
                this.configSubject.next(this.config);
            })
        );
    }

    /**
     * Return the (already loaded) configuration data.  It is expected that when this 
     * method is call that the configuration was already fetched (via fetchConfg()) at 
     * application start-up.  
     */
    public getConfig(): Configuration {
        return this.config ?? { baseUrl: "/", recaptchaApiKey: "" } as Configuration;
    }

    /**
     * Get the list of datasets from the configuration object.
     * @returns An observable containing the list of datasets.
     */
    public getDatasets(): Observable<Dataset[]> {
        return this.http.get(this.datasetsConfigUrl, { responseType: 'text' }).pipe(
            map(response => {
                const config = parse(response);
                return config.datasets;
            }),
            catchError(error => {
                const message = `Failed to fetch datasets: ${error.message}`;
                return throwError(new Error(message));
            })
        );
    }

    /**
     * Get the form template with the specified name from the configuration object.
     * @param formName The name of the form template.
     * @returns An observable containing the form template.
     */
    public getFormTemplate(formName: string): Observable<FormTemplate> {
        return this.http.get(this.datasetsConfigUrl, { responseType: 'text' }).pipe(
            map(response => {
                const config = parse(response);
                const formTemplates = Array.isArray(config.formTemplates) ? config.formTemplates : [];
                const matchingTemplate = formTemplates.find(template => template.id === formName);
                return matchingTemplate;
            }),
            catchError(error => {
                const message = `Failed to fetch form template: ${error.message}`;
                return throwError(new Error(message));
            })
        );
    }

    /**
     * Get the list of countries from the countries JSON file.
     * @returns An observable containing the list of countries.
     */
    public getCountries(countriesUrl: string | null = null): Observable<Country[]> {
        if (environment.debug) console.log("fetching countries list");
        if (!countriesUrl)
            countriesUrl = this.countriesUrl;
        return this.http.get<Country[]>(countriesUrl).pipe(catchError(this.handleError));
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



