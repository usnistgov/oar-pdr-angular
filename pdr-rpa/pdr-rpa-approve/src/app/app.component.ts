import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

import { ActivatedRoute, Router } from '@angular/router';
import { Record } from './model/record';
import { RPAService } from './service/rpa.service';
import { catchError, filter, pluck, switchMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { environment } from '../environments/environment';

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

  constructor(
    private route: ActivatedRoute,
    private rpaService: RPAService,
    private messageService: MessageService
  ) { }

  /**
   * Init the component state based on the record id retrieved from the route query params.
   */
  ngOnInit(): void {
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
        this.loaded = true;
      }),
      // Catche and logs any errors that occur
      catchError(error => {
        if (environment.debug) console.log(`[${this.constructor.name}] Error in onInit(): ${error}`);
        // Return an empty observable to prevent the error from propagating further
        return EMPTY;
      })
    ).subscribe();
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
    this.rpaService.approveRequest(this.recordId).subscribe({
      next: (data) => {
        if (environment.debug) console.log(`[${this.constructor.name}] Record ${this.recordId} approved by SME`);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'This request was approved successfully!' });
        location.reload();
        // Navigate to the current route again to refresh the page
        // this.router.navigate([this.router.url]);
      },
      error: (error) => {
        if (environment.debug) console.error(`[${this.constructor.name}] Error approving requestt: ${error}`);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error approving this request.' });
      },
      complete: () => {
        // Hide loading spinner
        this.displayProgressSpinner = false;
      },
    });
  }

  /**
   * Decline the RPA request for the current record and displays a success message.
   * Reload the page after the request has been declined.
  */
  onDecline(): void {
    // Display loading spinner
    this.displayProgressSpinner = true;
    // Send HTTP request to decline the user request
    this.rpaService.declineRequest(this.recordId).subscribe(
      {
        next: (data) => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was declined by SME!`);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'This request was declined successfully!' });
          location.reload();
          // Navigate to the current route again to refresh the page
          // this.router.navigate([this.router.url]);
        },
        error: (error) => {
          if (environment.debug) console.error(`[${this.constructor.name}] Error declining requestt: ${error}`);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error declining this request.' });
        },
        complete: () => {
          // Hide loading spinner
          this.displayProgressSpinner = false;
        },
      }
    );
  }

}
