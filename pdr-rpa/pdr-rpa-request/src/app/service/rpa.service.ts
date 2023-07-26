import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Record, RecordWrapper, UserInfo } from "../model/record.model";
import { ConfigurationService } from './config.service';
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { catchError, throwError } from 'rxjs';
import { tap } from "rxjs/operators";
import { retry } from 'rxjs/operators';

/**
 * Service responsible for submitting requests to the RPA request handler.
 * It provides functions to fetch a record and create a new record.
 */
@Injectable({
    providedIn: 'root',
})
export class RPAService {

    // private readonly DS_RPA_PATH = "/od/ds/rpa";
    private readonly REQUEST_ACCEPTED_PATH = "/request/accepted/";
    private readonly REQUEST_FORM_PATH = "/request/form";

    constructor(private http: HttpClient, private configSvc: ConfigurationService) { }

    /**
     * the baseURL for the RPA remote service
     */
    get baseUrl(): string { return this.configSvc.getConfig()['baseUrl'] }

    // Http Options
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    /**
     * Retrieve a record.
     * This sends an HTTP GET request to the distribution service.
     *
     * @param recordId - The ID of the record to retrieve
     * @returns An observable that emits the requested record
     * @throws An error if the request fails
     */
    public getRecord(recordId: string): Observable<RecordWrapper> {
        const url = this.getRecordUrl(recordId);
        const headers = { ...this.httpOptions };

        // Send HTTP GET request to fetch a record
        let request = this.http.get<RecordWrapper>(url, headers);

        if (environment.debug) {
            request = request.pipe(
                tap((data: RecordWrapper) => console.log(`[${this.constructor.name}] getRecord response:`, data))
            );
        }
        // Retry HTTP request once on failure, and handle any errors
        return request.pipe(
            retry(1),
            catchError(this.handleError)
        );
    }

    /**
     * Create a new record.
     * This sends an HTTP POST request to the distribution service.
     *
     * @param userInfo - The user information to create a record
     * @param recaptcha - The reCAPTCHA response token
     * @returns An observable that emits the created record
     * @throws An error if the request fails
     */
    public createRecord(userInfo: UserInfo, recaptcha: String): Observable<Record> {
        if (environment.debug) console.log(`[${this.constructor.name}] User Info:\n${JSON.stringify(userInfo, null, 2)}`);

        const url = this.getCreateRecordUrl();
        const payload = JSON.stringify({ "userInfo": userInfo, "recaptcha": recaptcha });
        const headers = { ...this.httpOptions };

        // Send HTTP POST request to create a new record
        let request = this.http.post<Record>(url, payload, headers);

        if (environment.debug) {
            request = request.pipe(
                tap((data: Record) => console.log(`[${this.constructor.name}] Created Record:\n${JSON.stringify(data, null, 2)}`))
            );
        }

        // Handle any errors and return
        return request.pipe(
            catchError(this.handleError)
        );
    }


    /**
     * Get the URL for retrieving a record.
     * @param recordId The ID of the record to retrieve.
     * @returns The URL for retrieving the record.
     */
    private getRecordUrl(recordId: string): string {
        // baseUrl = https://oardev.nist.gov/od/ds/rpa
        // return new URL(`${this.REQUEST_ACCEPTED_PATH}${recordId}`, this.baseUrl).toString();
        // Note: new URL() this strips the baseUrl from any appended path
        return `${this.baseUrl}${this.REQUEST_ACCEPTED_PATH}${recordId}`;
    }

    /**
     * Get the URL for creating a new record.
     * @returns The URL for creating a new record.
     */
    private getCreateRecordUrl(): string {
        // baseUrl = https://oardev.nist.gov/od/ds/rpa
        return `${this.baseUrl}${this.REQUEST_FORM_PATH}`;
    }

    /**
     * Handle errors from HTTP requests.
     *
     * @param error - The error object
     * @returns An observable that emits an error
     */
    // Error handling
    private handleError(error: any) {
        let errorMessage = '';
        let errorCode = '';

        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
            errorCode = 'CLIENT_ERROR';
        } else {
            // Get server-side error
            errorMessage = error.message;
            errorCode = error.status ? `SERVER_ERROR_${error.status}` : 'SERVER_ERROR';
        }

        const messageError = {
            code: errorCode,
            message: errorMessage
        };

        return throwError(messageError);
    }
}
