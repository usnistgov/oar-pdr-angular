import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { environment } from '../environments/environment';
import { RPAService } from './service/rpa.service';
import {
  FormConfigService,
  DynamicFormComponent,
  FormConfig,
  DatasetConfig,
  FieldOption
} from './dynamic-form';

interface Country {
  name: string;
  code: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('collapseAnimation', [
      state('expanded', style({
        height: '*',
        opacity: 1,
        paddingTop: '24px'
      })),
      state('collapsed', style({
        height: '0',
        opacity: 0,
        paddingTop: '0'
      })),
      transition('expanded <=> collapsed', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('dynamicForm') dynamicForm!: DynamicFormComponent;

  formConfig: FormConfig | null = null;
  selectedDataset: DatasetConfig | null = null;
  countryOptions: FieldOption[] = [];
  isLoading = false;
  datasetNotFound = false;
  isWelcomeCollapsed = false;
  isDarkMode = false;
  showCopyToast = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private formConfigService: FormConfigService,
    private rpaService: RPAService
  ) {}

  ngOnInit(): void {
    // Initialize dark mode from localStorage
    this.initDarkMode();

    // Load countries
    this.loadCountries();

    // Subscribe to route query parameters
    this.route.queryParams.subscribe(params => {
      if (params['ediid']) {
        this.loadFormForDataset(params['ediid']);
      } else {
        this.datasetNotFound = true;
      }
    });
  }

  /**
   * Load form configuration for a specific dataset
   */
  private loadFormForDataset(datasetId: string): void {
    this.isLoading = true;
    this.datasetNotFound = false;

    this.formConfigService.getFormForDataset('rpa-request', datasetId)
      .pipe(
        tap(result => {
          if (environment.debug) {
            console.log('[AppComponent] Loaded form config:', result);
          }
        }),
        catchError(error => {
          console.error('[AppComponent] Error loading form config:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        this.isLoading = false;

        if (result) {
          this.formConfig = result.form;
          this.selectedDataset = result.dataset;

          // Filter countries based on dataset blacklist
          if (this.selectedDataset.blockedCountries?.length) {
            this.filterBlockedCountries(this.selectedDataset.blockedCountries);
          }
        } else {
          this.datasetNotFound = true;
        }
      });
  }

  /**
   * Load countries for the country dropdown
   */
  private loadCountries(): void {
    const countriesUrl = environment.countriesUrl || 'assets/countries.json';

    this.http.get<Country[]>(countriesUrl)
      .pipe(
        map(countries => countries.map(c => ({
          label: c.name,
          value: c.name
        }))),
        catchError(error => {
          console.error('[AppComponent] Error loading countries:', error);
          return of([]);
        })
      )
      .subscribe(options => {
        this.countryOptions = options;

        if (environment.debug) {
          console.log('[AppComponent] Loaded countries:', options.length);
        }
      });
  }

  /**
   * Filter out blocked countries from options
   */
  private filterBlockedCountries(blockedCountries: string[]): void {
    const blockedSet = new Set(blockedCountries.map(c => c.toLowerCase()));
    this.countryOptions = this.countryOptions.filter(
      opt => !blockedSet.has(String(opt.label).toLowerCase())
    );
  }

  /**
   * Handle form submission
   */
  onFormSubmit(formValues: Record<string, any>): void {
    if (environment.debug) {
      console.log('[AppComponent] Form submitted:', formValues);
    }

    this.dynamicForm.setLoading(true);

    // Build the user info payload
    const userInfo = this.buildUserInfo(formValues);
    const recaptcha = formValues['recaptcha'];

    if (environment.simulateSubmission) {
      // Simulate submission (for UI testing without backend)
      console.log('[AppComponent] Simulated submission:', userInfo);
      setTimeout(() => {
        this.handleSubmissionSuccess({ id: 'test-123', caseNum: 'TEST-001' });
      }, 1500);
    } else {
      // Real submission
      this.rpaService.createRecord(userInfo, recaptcha)
        .pipe(
          catchError(error => {
            this.handleSubmissionError(error);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.handleSubmissionSuccess(result);
          }
        });
    }
  }

  /**
   * Build user info payload from form values
   */
  private buildUserInfo(formValues: Record<string, any>): any {
    const addressLines = [
      formValues['address1'],
      formValues['address2'],
      formValues['address3']
    ].filter(line => line && line.trim() !== '');

    const address = addressLines.join('\n');

    return {
      fullName: formValues['fullName'],
      organization: formValues['organization'],
      email: formValues['email'],
      country: formValues['country'],
      receiveEmails: formValues['receiveEmails'] ? 'True' : 'False',
      approvalStatus: 'Pending',
      productTitle: this.selectedDataset?.name || '',
      subject: this.selectedDataset?.id || '',
      description: `Product Title: ${this.selectedDataset?.name}\n\nPhone Number: ${formValues['phone']}\n\nAddress:\n${address}`
    };
  }

  /**
   * Handle successful form submission
   */
  private handleSubmissionSuccess(result: any): void {
    this.dynamicForm.setLoading(false);
    this.dynamicForm.showSuccess(
      this.formConfig?.successMessage ||
      'Your request was submitted successfully. You will receive a confirmation email shortly.'
    );
    this.dynamicForm.resetForm();

    if (environment.debug) {
      console.log('[AppComponent] Submission successful:', result);
    }
  }

  /**
   * Handle form submission error
   */
  private handleSubmissionError(error: any): void {
    this.dynamicForm.setLoading(false);
    this.dynamicForm.showError(
      'There was an error sending this request. Please contact datasupport@nist.gov'
    );

    console.error('[AppComponent] Submission error:', error);
  }

  /**
   * Toggle welcome section collapse state
   */
  toggleWelcome(): void {
    this.isWelcomeCollapsed = !this.isWelcomeCollapsed;
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
  }

  /**
   * Initialize dark mode from localStorage
   */
  private initDarkMode(): void {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  /**
   * Copy text to clipboard and show toast notification
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showCopyToast = true;
      setTimeout(() => {
        this.showCopyToast = false;
      }, 2000);
    });
  }
}
