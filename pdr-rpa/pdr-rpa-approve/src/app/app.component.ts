import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

import { ActivatedRoute, Router } from '@angular/router';
import { Record } from './model/record';
import { RPAService } from './service/rpa.service';
import { catchError, filter, finalize, pluck, switchMap, tap } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * Interface used to store product title, and address 
 * for parsing purposes.
 */
export interface RecordDescription {
  title: string;
  address: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService]
})
export class AppComponent {
  recordId: string;
  status: string;
  statusDate: string = "";
  record: Record;
  loaded: boolean = false;
  displayProgressSpinner: boolean = false;
  recordNotFound = false;
  recordDescription: RecordDescription;
  constructor(
    private route: ActivatedRoute,
    private rpaService: RPAService,
    private messageService: MessageService
  ) { }

  /**
   * Init the component state based on the record id retrieved from the route query params.
   */
  ngOnInit(): void {
    this.displayProgressSpinner = true;
    this.status = "pending";
    this.route.queryParams.pipe(
      // Extract the 'id' property from the query parameters
      pluck('id'),
      // Filter out undefined and null recordId values
      filter(recordId => !!recordId),
      // Set recordId
      tap(id => this.recordId = id),
      // Hide the progress spinner
      tap(() => this.displayProgressSpinner = false),
      // Retrieve the record from the RPA service
      switchMap(recordId => this.rpaService.getRecord(recordId)),
      // Extract the 'record' property from the RecordWrapper
      pluck('record'),
      // Update the component state with the retrieved record
      tap(record => {
        this.record = record;
        this.parseApprovalStatus(this.record);
        this.parseDescription(this.record.userInfo.description);
        this.loaded = true;
      }),
      // Catche and logs any errors that occur
      catchError(error => {
        if (environment.debug) console.log(`[${this.constructor.name}] Error in onInit(): ${error()}`);
        // Return an empty observable to prevent the error from propagating further
        this.recordNotFound = true;
        this.displayProgressSpinner = false
        return EMPTY;
      })
    ).subscribe();
  }

  /**
   * Parses the description from a Record object to extract
   * the product title, and the address. 
   * Sets the extracted values in the recordDescription object.
   * 
   * @param record The Record object to parse the user info description from.
   */
  parseDescription(description: string) {
    // Define regex

    // This matches the string 'Product Title:' at the start of a line ^,
    // followed by any number of whitespace characters \s*, 
    // and then matches any characters (.*) until the end of the line $.
    // m flag enables multiline matching, not just the start end end of the description.
    const titleRegex = /^Product Title:\s*(.*)$/m;

    // This matches the string Address: at the start of a line ^,
    // followed by any number of whitespace characters \s*, 
    // and then matches any characters (including newlines) ([\s\S]*) until the end of the line $.
    const addressRegex = /^Address:\s*([\s\S]*)$/m;

    // Returns match result
    const titleMatch = titleRegex.exec(description);
    const addressMatch = addressRegex.exec(description);

    // Assigns matched values if found, otherwise assigns an empty string.
    const title = titleMatch ? titleMatch[1] : '';
    const address = addressMatch ? addressMatch[1].split('\n').join(', ') : '';

    this.recordDescription = {
      title,
      address,
    };

    if (environment.debug) console.log(this.recordDescription);
  }

  /**
   * Parse the approval status of the record and update the component state with the
   * status and status date.
   * 
   * @param record - The record to parse the approval status of.
   */
  private parseApprovalStatus(record: Record): void {
    this.status = record.userInfo.approvalStatus;
    if (this.status.includes("Approved")) {
      this.statusDate = this.status.replace("Approved_", "");
    } else if (this.status.includes("Declined")) {
      this.statusDate = this.status.replace("Declined_", "");
    }
  }


  /**
   * Approve the RPA request for the current record and displays a success message.
   * Reload the page after the request has been approved.
  */
  onApprove(): void {
    // Display loading spinner
    this.displayProgressSpinner = true;
    // Send HTTP request to approve the user request
    this.rpaService.approveRequest(this.recordId).pipe(
      catchError(error => {
        if (environment.debug) console.error(`[${this.constructor.name}] Error approving request:`, error());
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error approving this request.', life: 5000 });
        return throwError(error); // re-throw the error to be caught by the subscribing function
      })
    )
      .subscribe(
        data => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was approving by SME!`);
          this.displayProgressSpinner = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'This request was approved successfully!', life: 5000 }); 
          setTimeout(() => {
            location.reload();
          }, 3000); // dismiss success message after few seconds
        }
      );
  }


  /**
   * Decline the RPA request for the current record and displays a success message.
   * Reload the page after the request has been declined.
  */
  onDecline(): void {
    // Display loading spinner
    this.displayProgressSpinner = true;
    // Send HTTP request to decline the user request
    this.rpaService.declineRequest(this.recordId)
      .pipe(
        catchError(error => {
          if (environment.debug) console.error(`[${this.constructor.name}] Error declining request:`, error());
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error declining this request.', life: 5000 });
          return throwError(error); // re-throw the error to be caught by the subscribing function
        })
      )
      .subscribe(
        data => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was declined by SME!`);
          this.displayProgressSpinner = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'This request was declined successfully!', life: 5000 });
          setTimeout(() => {
            location.reload();
          }, 3000); // dismiss success message after few seconds

        }
      );
  }
}
