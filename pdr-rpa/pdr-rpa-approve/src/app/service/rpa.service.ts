import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { formatDate } from '@angular/common';

import { ApprovalResponse, Record, RecordWrapper, UserInfo } from "../model/record";
import { ConfigurationService } from './config.service';
import { environment } from "../../environments/environment";

@Injectable()
export class RPAService {

    baseUrl: string;

    constructor(private http: HttpClient, private configSvc: ConfigurationService) {
        // Get the base URL from the environment
        this.baseUrl = this.configSvc.getConfig().baseUrl;
    }

    // Http Options
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
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
    * Approve a request. 
    * This send a HTTP PATCH request to the distribution service to update the record status.
    *
    * @param recordId - The ID of the record to update
    * @returns The new record status
    *
    */
    public approveRequest(recordId: string): Observable<ApprovalResponse> {
        return this.http
                .patch<ApprovalResponse>(this.baseUrl + "/request/accepted/" + recordId, 
                {"Approval_Status__c":`Approved_${formatDate(Date.now(),'yyyy-MM-dd h:mm a','en-US')}`}, 
                this.httpOptions)
                .pipe(catchError(this.handleError));
    }

    /**
    * Decline a request. 
    * This send a HTTP PATCH request to the distribution service to update the record status.
    *
    * @param recordId - The ID of the record to update
    * @returns The new record status
    *
    */
    public declineRequest(recordId: string): Observable<ApprovalResponse> {
        return this.http
                .patch<ApprovalResponse>(this.baseUrl + "/request/accepted/" + recordId, 
                {"Approval_Status__c":`Declined_${formatDate(Date.now(),'yyyy-MM-dd h:mm a','en-US')}`}, 
                this.httpOptions)
                .pipe(catchError(this.handleError));
    }

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
