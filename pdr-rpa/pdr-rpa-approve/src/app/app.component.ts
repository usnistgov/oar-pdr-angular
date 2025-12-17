import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ActivatedRoute, Router, Params } from '@angular/router';
import { Record } from './model/record';
import { RPAService } from './service/rpa.service';
import { AuthenticationService, Credentials } from 'oarng';
import { catchError, pluck, switchMap, map, tap, delay } from 'rxjs/operators';
import { Observable, EMPTY, throwError, of } from 'rxjs';
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
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  recordId: string;
  status: string;
  statusDate: string = "";
  smeEmail: string = "";
  randomId: string = "";
  record: Record;
  loaded: boolean = false;
  displayProgressSpinner: boolean = false;
  recordNotFound = false;
  errorMessage: string = '';
  errorTitle: string = '';
  recordDescription: RecordDescription;
  _creds: Credentials;
  isDarkMode: boolean = false;

  // Toast notification state
  toastVisible: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  // Mock data for simulation mode
  private mockRecord: Record = {
    id: 'mock-123',
    caseNum: 'CASE-2024-001234',
    userInfo: {
      fullName: 'John Doe',
      organization: 'National Institute of Standards and Technology',
      email: 'john.doe@nist.gov',
      receiveEmails: 'Yes',
      country: 'United States',
      approvalStatus: 'Pending',
      productTitle: 'NIST Fingerprint Image Quality (NFIQ) 2 Conformance Test Set',
      subject: 'ark:/88434/mds2-2909',
      description: 'Product Title: NIST Fingerprint Image Quality (NFIQ) 2 Conformance Test Set\n\nPhone Number: 301-975-6478\n\nAddress:\n100 Bureau Drive\nGaithersburg, MD 20899'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private rpaService: RPAService,
    private authService: AuthenticationService
  ) { }

  /**
   * Init the component state based on the record id retrieved from the route query params.
   */
  ngOnInit(): void {
    this.initDarkMode();
    this.displayProgressSpinner = true;
    this.status = "pending";

    // Use simulation mode if enabled
    if (environment.simulateData) {
      this.loadSimulatedData();
      return;
    }

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
        console.error("App init failed: " + error.message);

        // Set specific error messages based on error type
        if (error instanceof ClientError) {
          if (error.message.includes("No request identifier")) {
            this.errorTitle = "Missing Request ID";
            this.errorMessage = "No request identifier was provided in the URL. Please check the link you received.";
          } else if (error.message.includes("Authentication")) {
            this.errorTitle = "Authentication Failed";
            this.errorMessage = "Unable to authenticate. Please try reloading the page.";
          } else {
            this.errorTitle = "Request Error";
            this.errorMessage = error.message;
          }
        } else {
          this.errorTitle = "Something Went Wrong";
          this.errorMessage = "We couldn't load the request details. Please try again later.";
        }

        // Show toast notification
        this.showToast(this.errorMessage, 'error');

        // Return an empty observable to prevent the error from propagating further
        this.recordNotFound = true;
        this.displayProgressSpinner = false;
        return EMPTY;
      })
    ).subscribe();
  }

  /**
   * Load simulated data for UI testing without backend
   * URL params:
   *   ?status=pending|approved|declined - test approval states
   *   ?error=missing-id|auth|backend - test error states
   */
  private loadSimulatedData(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'] || 'pending';
      const error = params['error'];

      // Simulate error states
      if (error) {
        setTimeout(() => {
          this.displayProgressSpinner = false;
          this.recordNotFound = true;

          switch (error) {
            case 'missing-id':
              this.errorTitle = 'Missing Request ID';
              this.errorMessage = 'No request identifier was provided in the URL. Please check the link you received.';
              break;
            case 'auth':
              this.errorTitle = 'Authentication Failed';
              this.errorMessage = 'Unable to authenticate. Please try reloading the page.';
              break;
            case 'backend':
              this.errorTitle = 'Something Went Wrong';
              this.errorMessage = 'We couldn\'t load the request details. Please try again later.';
              break;
            default:
              this.errorTitle = 'Error';
              this.errorMessage = 'An unknown error occurred.';
          }

          this.showToast(this.errorMessage, 'error');
          if (environment.debug) console.log('[Simulation] Error state:', error);
        }, 800);
        return;
      }

      // Normal flow - simulate approval states
      this.recordId = 'mock-123';

      // Update mock record based on status param
      if (status === 'approved') {
        this.mockRecord.userInfo.approvalStatus = 'Approved_2024-01-15T10:30:00.000Z_sme@nist.gov';
      } else if (status === 'declined') {
        this.mockRecord.userInfo.approvalStatus = 'Declined_2024-01-15T14:45:00.000Z_sme@nist.gov';
      } else {
        this.mockRecord.userInfo.approvalStatus = 'Pending';
      }

      // Simulate network delay
      setTimeout(() => {
        this.record = this.mockRecord;
        this.parseApprovalStatus(this.record);
        this.parseDescription(this.record.userInfo.description);
        this.displayProgressSpinner = false;
        this.loaded = true;
        if (environment.debug) console.log('[Simulation] Loaded mock record:', this.record);
      }, 800);
    });
  }

  /**
   * Initialize dark mode from localStorage
   */
  initDarkMode(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  /**
   * Toggle dark mode and save preference
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  /**
   * Refresh the page
   */
  refreshPage(): void {
    window.location.reload();
  }

  /**
   * ensure that the user is authenticated.  The returned Observable won't provide a value until
   * authentication process completes successfully.
   * @return Observable<string> -- an Observable to the ID of the request to be approved
   *                  authentication is complete.
   */
  authenticate(): Observable<string> {
    return this.authService.getCredentials().pipe(
      // cache the credentials
      tap(c => this._creds = c),

      // get the requested record ID
      switchMap(c => this.route.queryParams),
      map((params: Params) => {
        if (!this._creds || !this._creds.token)
          throw new ClientError("Authentication failed. (Try reloading this URL.)");
        if (!params.id)
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
   * status, status date, email, and random ID.
   * If the status is "Pending", the date and email will be undefined.
   *
   * @param record - The record to parse the approval status of.
   */
  parseApprovalStatus(record: Record): void {
    let statusParts = record.userInfo.approvalStatus.split("_");

    this.status = statusParts[0];

    if (this.status.toLowerCase() === "pending") {
      this.statusDate = "";
      this.smeEmail = "";
      this.randomId = "";
    } else if (statusParts.length === 3 || statusParts.length === 4) {
      this.statusDate = statusParts[1];
      this.smeEmail = statusParts[2];
      if (statusParts.length === 4) {
        this.randomId = statusParts[3];
      }
    } else {
      // Handle unexpected format
      throw new ClientError("Unexpected approval status format");
    }
  }

  /**
   * Show a toast notification
   */
  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  /**
   * Hide the toast notification
   */
  hideToast(): void {
    this.toastVisible = false;
  }

  /**
   * Approve the RPA request for the current record and displays a success message.
   * Reload the page after the request has been approved.
  */
  onApprove(): void {
    // Display loading spinner
    this.displayProgressSpinner = true;

    // Simulation mode
    if (environment.simulateData) {
      setTimeout(() => {
        if (environment.debug) console.log('[Simulation] Request approved');
        this.showToast('This request was approved successfully!', 'success');
        this.displayProgressSpinner = false;
        // Update status locally to show approved state
        this.status = 'Approved';
        this.statusDate = new Date().toISOString();
        this.smeEmail = 'sme@nist.gov';
      }, 1000);
      return;
    }

    // Send HTTP request to approve the user request
    this.rpaService.approveRequest(this.recordId, this._creds).pipe(
      catchError(error => {
        if (environment.debug) console.error(`[${this.constructor.name}] Error approving request:`, error());
        this.showToast('There was an error approving this request.', 'error');
        this.displayProgressSpinner = false;
        return throwError(error); // re-throw the error to be caught by the subscribing function
      })
    )
      .subscribe(
        data => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was approved by SME!`);
          this.showToast('This request was approved successfully!', 'success');
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

    // Simulation mode
    if (environment.simulateData) {
      setTimeout(() => {
        if (environment.debug) console.log('[Simulation] Request declined');
        this.showToast('This request was declined successfully!', 'success');
        this.displayProgressSpinner = false;
        // Update status locally to show declined state
        this.status = 'Declined';
        this.statusDate = new Date().toISOString();
        this.smeEmail = 'sme@nist.gov';
      }, 1000);
      return;
    }

    // Send HTTP request to decline the user request
    this.rpaService.declineRequest(this.recordId, this._creds)
      .pipe(
        catchError(error => {
          if (environment.debug) console.error(`[${this.constructor.name}] Error declining request:`, error());
          this.showToast('There was an error declining this request.', 'error');
          this.displayProgressSpinner = false;
          return throwError(error); // re-throw the error to be caught by the subscribing function
        })
      )
      .subscribe(
        data => {
          if (environment.debug) console.log(`[${this.constructor.name}] Request for ${this.recordId} was declined by SME!`);

          this.showToast('This request was declined successfully!', 'success');
          setTimeout(() => {
            location.reload();
          }, 3000); // dismiss success message after few seconds

        }
      );
  }
}
