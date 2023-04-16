import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { Configuration } from "../model/config.model";
import { environment } from "../../environments/environment";

/**
 * Service responsible for providing configuration data for the application.
 * It loads the configuration from a given file and provides access to it
 * throughout the app.
 */
@Injectable()
export class ConfigurationService {

    configUrl = environment.configUrl;
    config : Configuration = null;

    constructor(private http: HttpClient) { }

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
            return { baseUrl: "/" } as Configuration;
        return this.config;
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



