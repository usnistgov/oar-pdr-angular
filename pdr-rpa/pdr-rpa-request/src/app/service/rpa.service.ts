import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { Record, RecordWrapper, UserInfo } from "../model/record.model";
import { environment } from "../../environments/environment";

@Injectable()
export class RPAService {

    baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = environment.requestHandlerUrl;
    }

    // Http Options
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    /**
    * Retrieve a record. 
    * This send a HTTP GET request to the distribution service.
    *
    * @param recordId - The ID of the record to retrieve
    * @returns The requested record
    *
    */
    public getRecord(recordId: string): Observable<RecordWrapper> {
        return this.http
            .get<RecordWrapper>(
                this.baseUrl + "/request/accepted/" + recordId,
                this.httpOptions)
            .pipe(retry(1), catchError(this.handleError));
    }

    /**
    * Create a new record. 
    * This send a HTTP POST request to the distribution service.
    *
    * @param userInfo - The user information to create a record
    * @returns The created record
    *
    */
    public createRecord(userInfo: UserInfo): Observable<Record> {
        console.log("User Info", userInfo);
        return this.http
            .post<Record>(
                this.baseUrl + "/request/form",
                JSON.stringify({ "userInfo": userInfo }),
                this.httpOptions
            )
            .pipe(catchError(this.handleError));
    }


    // Function to test recaptcha is working
    // public verifyRecaptcha(token: string): Observable<RecaptchaResponse> {
    //     console.log("Recaptcha Token", token);
    //     return this.http
    //         .post<RecaptchaResponse>(
    //             this.baseUrl + "/recaptcha/verify",
    //             token,
    //             this.httpOptions
    //         )
    //         .pipe(catchError(this.handleError));
    // }

    // Error handling
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