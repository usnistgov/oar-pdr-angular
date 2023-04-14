import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, retry, tap } from "rxjs/operators";

import { Record, RecordWrapper, UserInfo } from "../model/record.model";
import { ConfigurationService } from './config.service';
import { environment } from "../../environments/environment";

/**
 * Service responsible for submitting requests to the RPA request handler.
 * It provides functions to fetch a record and create a new record.
 */
@Injectable()
export class RPAService {

    private readonly REQUEST_ACCEPTED_PATH = "/request/accepted";
    private readonly REQUEST_FORM_PATH = "/request/form";
    baseUrl: string;

    constructor(private http: HttpClient, private configSvc: ConfigurationService) {
        // Get the base URL from the environment
        this.baseUrl = this.configSvc.getConfig().baseUrl;
    }

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
        // Send HTTP GET request to fetch a record
        let request = this.http.get<RecordWrapper>(
            this.baseUrl + this.REQUEST_ACCEPTED_PATH + "/" + recordId,
            this.httpOptions
        );

        if (environment.debug) {
            request = request.pipe(
                tap((data: RecordWrapper) => console.log('getRecord response:', data))
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
        if (environment.debug) {
            console.log("User Info:" + JSON.stringify(userInfo, null, 2));
        }

        // Send HTTP POST request to create a new record
        let request = this.http.post<Record>(
            this.baseUrl + this.REQUEST_FORM_PATH,
            JSON.stringify({ "userInfo": userInfo, "recaptcha": recaptcha }),
            this.httpOptions
        );

        if (environment.debug) {
            request = request.pipe(
                tap((data: Record) => console.log('Created Record:', + JSON.stringify(data, null, 2)))
            );
        }

        // Handle any errors and return
        return request.pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Handle errors from HTTP requests.
     *
     * @param error - The error object
     * @returns An observable that emits an error
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
