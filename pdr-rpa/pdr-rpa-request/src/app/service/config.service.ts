import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { parse } from 'yaml';
import { BehaviorSubject, Observable, Subject, of, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Country } from "../model/country.model";
import { FormTemplate } from "../model/form-template.model";
import { Dataset } from "../model/dataset.model";
import { RPAConfiguration } from "../model/config.model";
import { ConfigurationService as BaseConfigurationService } from 'oarng';
import { environment } from "../../environments/environment";
import { RELEASE } from '../../environments/release-info';

/**
 * Service responsible for providing configuration data for the application.
 * It loads the configuration from a given file and provides access to it
 * throughout the app.
 */
@Injectable({
    providedIn: 'root',
})
export class ConfigurationService extends BaseConfigurationService {
    
    datasetsConfigUrl: string = environment.datasetsConfigUrl;
    countriesUrl: string = environment.countriesUrl;
    config: RPAConfiguration | null = null;

    constructor(http: HttpClient) {
        super(http, RELEASE, environment.configUrl);
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
        if (!countriesUrl)
        countriesUrl = this.countriesUrl;
        if (environment.debug) console.log(`[${this.constructor.name}] fetching countries list from "${countriesUrl}"`);
        return this.http.get<Country[]>(countriesUrl).pipe(catchError(this.handleError));
    }
}



