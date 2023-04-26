import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { formatDate } from '@angular/common';

import { ApprovalResponse, RecordWrapper } from "../model/record";
import { ConfigurationService } from './config.service';

/**
 * Service responsible for update the status of the RPA records.
 * It provides functions to fetch a record and update the status of an existing record.
 */
@Injectable()
export class RPAService {

    private readonly REQUEST_ACCEPTED_PATH = "/request/accepted/";
    // the base URL of the RPA request handler service
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
        const url = this.getRecordUrl(recordId);
        const headers = { ...this.httpOptions };
        return this.http.get<RecordWrapper>(url, headers).pipe(retry(1), catchError(this.handleError));
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
        const approvalStatus = `Approved_${formatDate(Date.now(), 'yyyy-MM-dd h:mm a', 'en-US')}`;
        const url = this.getRecordUrl(recordId);
        const payload = this.getApprovalPayload(approvalStatus);
        const headers = { ...this.httpOptions };
        return this.http.patch<ApprovalResponse>(url, payload, headers).pipe(catchError(this.handleError));
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
        const approvalStatus = `Declined_${formatDate(Date.now(), 'yyyy-MM-dd h:mm a', 'en-US')}`;
        const url = this.getRecordUrl(recordId);
        const payload = this.getApprovalPayload(approvalStatus);
        const headers = { ...this.httpOptions };
        return this.http.patch<ApprovalResponse>(url, payload, headers).pipe(catchError(this.handleError));
    }

    /**
     * Builds the URL for a record with the given ID, using the base URL stored in this service.
     *
     * @param recordId - The ID of the record to build the URL for.
     * @returns The URL string for the specified record.
     */
    private getRecordUrl(recordId: string): string {
        return `${this.baseUrl}${this.REQUEST_ACCEPTED_PATH}${recordId}`;
    }

    /**
     * Builds the payload object for an approval request with the specified approval status.
     *
     * @param approvalStatus - The approval status to set in the payload object.
     * @returns The payload object with the specified approval status.
     */
    private getApprovalPayload(approvalStatus: string): any {
        return { "Approval_Status__c": approvalStatus };
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
