import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

import { ActivatedRoute, Router, Params } from '@angular/router';
import { Record } from './model/record';
import { RPAService } from './service/rpa.service';
import { AuthenticationService, Credentials } from 'oarng';
import { catchError, pluck, switchMap, map, tap } from 'rxjs/operators';
import { Observable, EMPTY, throwError } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * Interface used to store product title, and address 
 * for parsing purposes.
 */
export interface RecordDescription {
  title: string;
  phone: string;
  address: string;
}

/**
 * A specialized Error indicating a error originating with from client action/inaction; the 
 * message is assumed to be one directed at the user (rather than the programmer) and can be 
 * displayed in the application in some way.
 */
class ClientError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, ClientError.prototype);
  }
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
  smeEmail: string = "";
  record: Record;
  loaded: boolean = false;
  displayProgressSpinner: boolean = false;
  recordNotFound = false;
  recordDescription: RecordDescription;
  _creds: Credentials;
    
  constructor(
    private route: ActivatedRoute,
    private rpaService: RPAService,
    private messageService: MessageService,
    private authService: AuthenticationService
  ) { }

  /**
   * Init the component state based on the record id retrieved from the route query params.
   */
  ngOnInit(): void {
    this.displayProgressSpinner = true;
    this.status = "pending";
    this.authenticate().pipe(
      tap(recordId => this.recordId = recordId),

      // Retrieve the record from the RPA service
      switchMap(recordId => this.rpaService.getRecord(recordId as string, this._creds)),

      // Extract the 'record' property from the RecordWrapper
      // Hide the progress spinner
      tap(() => this.displayProgressSpinner = false),
      pluck('record'),

      // Update the component state with the retrieved record
      tap(record => {
        this.record = record as Record;
        this.parseApprovalStatus(this.record);
        this.parseDescription(this.record.userInfo.description);
        this.loaded = true;
      }),

      // Catch and log any errors that occur
      catchError(error => {
        console.error("App init failed: "+error.message);
        if (error instanceof ClientError)
          alert("Unable to open request: "+error.message);
        else
          alert("Unable to open request due to internal error; try reloading page.")

        // Return an empty observable to prevent the error from propagating further
        this.recordNotFound = true;
        this.displayProgressSpinner = false
        return EMPTY;
      })
    ).subscribe();
  }

    /**
     * ensure that the user is authenticated.  The returned Observable won't provide a value until 
     * authentication process completes successfully.
     * @return Observable<string> -- an Observable to the ID of the request to be approved
     *                  authentication is complete.  
     */
    authenticate() : Observable<string> {
      return this.authService.getCredentials().pipe(
          // cache the credentials
          tap(c => this._creds = c),
  
          // get the requested record ID
          switchMap(c => this.route.queryParams),
          map((params: Params) => {
              if (!this._creds || !this._creds.token)
                  throw new ClientError("Authentication failed. (Try reloading this URL.)");
              if (! params.id)
                  throw new ClientError("No request identifier provided!");
              return params.id;
          })
      );
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

    // This matches the string 'Phone Number:' at the start of a line ^,
    // followed by any number of whitespace characters \s*, 
    // and then matches one or more digits, whitespace characters, or hyphens. 
    // This allows the formats '123-456-7890', '123 456 7890', or '1234567890' until the end of the line $.
    const phoneRegex = /^Phone Number:\s*([\d\s-]+)$/m;

    // This matches the string Address: at the start of a line ^,
    // followed by any number of whitespace characters \s*, 
    // and then matches any characters (including newlines) ([\s\S]*) until the end of the line $.
    const addressRegex = /^Address:\s*([\s\S]*)$/m;

    // Returns match result
    const titleMatch = titleRegex.exec(description);
    const phoneMatch = phoneRegex.exec(description);
    const addressMatch = addressRegex.exec(description);

    // Assigns matched values if found, otherwise assigns an empty string.
    const title = titleMatch ? titleMatch[1] : '';
    const phone = phoneMatch ? phoneMatch[1].trim() : '';
    const address = addressMatch ? addressMatch[1].split('\n').join(', ') : '';

    this.recordDescription = {
      title,
      phone,
      address,
    };

    if (environment.debug) console.log(this.recordDescription);
  }

  /**
   * Parse the approval status of the record and update the component state with the
   * status, status date, and email. If the status is "Pending", the date and email will be undefined.
   * 
   * @param record - The record to parse the approval status of.
   */
  private parseApprovalStatus(record: Record): void {
    let statusParts = record.userInfo.approvalStatus.split("_");

    this.status = statusParts[0];

    if(this.status.toLowerCase() === "pending") {
        this.statusDate = "";
        this.smeEmail = "";
    } else if (statusParts.length === 3) {
        this.statusDate = statusParts[1];
        this.smeEmail = statusParts[2];
    } else {
      // Handle unexpected format
      throw new ClientError("Unexpected approval status format");
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
    this.rpaService.approveRequest(this.recordId, this._creds).pipe(
      catchError(error => {
        if (environment.debug) console.error(`[${this.constructor.name}] Error approving request:`, error());
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error approving this request.', life: 5000 });
        return throwError(error); // re-throw the error to be caught by the subscribing function
      })
    )
      .subscribe(
        data => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was approving by SME!`);
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
    this.rpaService.declineRequest(this.recordId, this._creds)
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
          
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'This request was declined successfully!', life: 5000 });
          setTimeout(() => {
            location.reload();
          }, 3000); // dismiss success message after few seconds

        }
      );
  }
}
