import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Country } from './model/country.model';
import { Dataset } from './model/dataset.model';
import { RequestFormData } from './model/form-data.model';
import { FormTemplate } from './model/form-template.model';
import { UserInfo } from './model/record.model';

import { MessageService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { catchError, map, tap } from 'rxjs/operators';
import { RPAService } from './service/rpa.service';
import { ConfigurationService } from './service/config.service';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class AppComponent {
    queryId: string;
    datasets: Dataset[] = [];
    selectedDataset: Dataset | null | undefined;
    selectedFormTemplate: FormTemplate | null| undefined;
    isFormValid = true;
    displayProgressSpinner = false;
    errors = [];
    requestForm: FormGroup;
    countries: Country[];
    selectedCountry: Country;
    items: SelectItem[];
    item: SelectItem;
    domparser = new DOMParser();

    constructor(private route: ActivatedRoute,
        private messageService: MessageService,
        private configService: ConfigurationService,
        private rpaService: RPAService) {
        this.initRequestForm();
    }

    /**
     * Initializes component on page load
    */
    ngOnInit(): void {
        // Subscribe to route query parameters to extract 'ediid' value
        this.route.queryParams.subscribe((params) => {
            // Hide progress spinner
            this.displayProgressSpinner = false;
            // If 'ediid' is present, set the selected dataset using its value
            if (params['ediid']) {
                this.queryId = params['ediid'];
                this.setSelecetedDataset(this.queryId);
            }
            // Load countries list for use with dropdown menu


        });
        this.loadCountries().subscribe((data) => {
            if (environment.debug) console.log("loaded countries", this.countries);
        });

    }

    /**
   * Choose selectedDataset, and pick the appropriate form template from the config file
   * @param ediid the dataset ID
   */
    setSelecetedDataset(ediid: string): void {
        this.getDatasets()
            // Start RxJs opeartors chaining
            .pipe(
                // Log datasets obtained from getDatasets()
                tap((datasets) => {
                    if (environment.debug) console.log('Datasets', datasets);
                }),
                // Find the dataset with matching ediid
                map((datasets) => datasets.find((dataset) => dataset.ediid === ediid)),
                // Log selecteDataset and retrieve the corresponding form template using the getFormTemplate()
                tap((selectedDataset) => {
                    if (environment.debug) console.log('Selected Dataset', selectedDataset);
                    if (selectedDataset) {
                        this.configService
                            .getFormTemplate(selectedDataset.formTemplate)
                            .subscribe((template) => {
                                this.selectedFormTemplate = template;
                                if (environment.debug) console.log(template);
                            });
                    }
                })
            )
            .subscribe((selectedDataset) => (this.selectedDataset = selectedDataset));
    }

    /**
   * Get the list of datasets present in the config file
   */
    getDatasets(): Observable<Dataset[]> {
        return this.configService.getDatasets();
    }

    /**
  * Load the countries list to use with the dropdown menu
  * 
  * @returns Observable containing list of countries
  */
    loadCountries(): Observable<Country[]> {
        return this.configService.getCountries().pipe(
            tap((data) => {
                this.countries = data;
            }),
            catchError((error) => {
                console.error(error);
                return of([]); // Return an empty array to prevent any further errors
            })
        );
    }

    /**
     * Fetch dataset from config file using the dataset EDIID we extract from the url
     * @param ediid the dataset ID
     */
    getSelectedDataset(ediid: string): Observable<Dataset | undefined> {
        return this.getDatasets().pipe(
            map(datasets => datasets.find(dataset => dataset.ediid == ediid))
        );
    }


    /**
     * Get the appropriate form template for a specific dataset
     * @param dataset target dataset
     */
    getFormTemplate(dataset: Dataset): Observable<FormTemplate> {
        return this.configService.getFormTemplate(dataset.formTemplate).pipe(
            tap(template => {
                this.selectedFormTemplate = template;
                if (environment.debug) console.log("Form Template", this.selectedDataset!.formTemplate);
            })
        );
    }

    /**
   * Submit the form to the request handler
   */
    submitForm(): void {
        this.beforeSubmitForm();

        // If the form is invalid, display an error message
        if (!this.requestForm.valid) {
            // Get any validation errors in the form
            let errors = this.getFormErrors(this.requestForm);
            if (errors) {
                if (environment.debug) console.log(errors);
                this.handleInvalidForm(errors);
            }
        } else {
            // Collect data from request form
            const requestFormData = this.getRequestFormData();

            // Set reCAPTCHA response, and user info
            const recaptcha = this.requestForm.controls.recaptcha.value;
            const userInfo = this.getUserInfo(requestFormData);

            // Create a new record and handle the response
            this.rpaService.createRecord(userInfo, recaptcha)
                .pipe(
                    catchError((error: any) => {
                        if (environment.debug) console.error(error);
                        this.displayProgressSpinner = false; // stop spinner when error
                        return throwError(error);
                    })
                ).subscribe((data: {}) => {
                    this.handleSuccessfulSubmission(data);
                });
        }
    }

    /**
     * Prepare form submission
     */
    private beforeSubmitForm() {
        this.messageService.clear();
        this.displayProgressSpinner = false;
    }

    /**
     * Handle invalid form submission
     */
    private handleInvalidForm(validationErrors: ValidationErrors): void {
        this.isFormValid = false;
        this.displayProgressSpinner = false;

        let errorMessage = 'Invalid form. Check if any required fields (*) are missing.';
        // let errorsText = this.getErrorsText(validationErrors);
        const message = {
            severity: 'error',
            summary: 'Error',
            detail: errorMessage, //+ messages.join(','),
            escape: false // don't escape html
        };
        this.messageService.add(message);
        setTimeout(() => this.messageService.clear(), 10000);
    }


    /**
    * Take the list of validation errors and turn them a string to display in Error message
    */
    private getErrorsText(validationErrors: any): string {
        let messages: string[] = [];
        for (const validationError of validationErrors) {
            let validationErrorString = '';
            let errors = validationError["error"]
            for (const errorType in errors) {
                switch (errorType) {
                    case 'required':
                        validationErrorString += `${validationError['field']} is required. `;
                        break;
                    case 'minlength':
                        validationErrorString += `${validationError['field']} must be at least ${errors[errorType]} characters. `;
                        break;
                    case 'maxlength':
                        validationErrorString += `${validationError['field']} cannot exceed ${errors[errorType]} characters. `;
                        break;
                    default:
                        validationErrorString += `Invalid value for ${validationError['field']}. `;
                        break;
                }
                messages.push(validationErrorString);
            }
        }
        return messages.join('<br>');
    }

    /**
     * Get the request form data
     */
    private getRequestFormData(): RequestFormData {
        const requestFormData = {} as RequestFormData;
        const formControls = this.requestForm.controls;

        requestFormData.fullName = formControls.fullName.value;
        requestFormData.email = formControls.email.value;
        requestFormData.phone = formControls.phone.value;
        requestFormData.organization = formControls.organization.value;
        requestFormData.purposeOfUse = formControls.purposeOfUse.value;
        requestFormData.address1 = formControls.address1.value;
        requestFormData.address2 = formControls.address2.value;
        requestFormData.address3 = formControls.address3.value;
        requestFormData.stateOrProvince = formControls.stateOrProvince.value;
        requestFormData.zipCode = formControls.zipCode.value;
        requestFormData.country = formControls.country.value.name;
        requestFormData.receiveEmails = formControls.receiveEmails.value;

        return requestFormData;
    }

    /**
     * Handle successful form submission
     */
    private handleSuccessfulSubmission(data: any): void {
        // Log data
        if (environment.debug) console.log("Data from RequestHandler", data);
        // Remove spinner layer
        this.displayProgressSpinner = false;
        // Display success message
        const message = { severity: 'success', summary: 'Success', detail: 'Your request was submitted successfully! You will receive a confirmation email shortly.' };
        this.messageService.add(message);
        setTimeout(() => this.messageService.clear(), 5000); // dismiss success message after few seconds
        // Empty form
        this.requestForm.reset();
    }


    /**
     * Helper method to create the userInfo that will be used as payload for creating a new record case in SF.
     */
    private getUserInfo(requestFormData: RequestFormData): UserInfo {
        let userInfo = {} as UserInfo;
        userInfo.fullName = requestFormData.fullName;
        userInfo.organization = requestFormData.organization;
        userInfo.email = requestFormData.email;
        userInfo.country = requestFormData.country;
        userInfo.receiveEmails = requestFormData.receiveEmails ? "True" : "False";
        userInfo.approvalStatus = "Pending";
        userInfo.productTitle = this.selectedDataset!.name;
        userInfo.subject = this.selectedDataset!.ediid;
        userInfo.description = "Product Title:\n" + this.selectedDataset!.name + "\n\n Purpose of Use: \n" + requestFormData.purposeOfUse;
        return userInfo;
    }

    private initRequestForm(): void {
        this.requestForm = new FormGroup({
            fullName: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
            email: new FormControl("", [Validators.required, Validators.email]),
            phone: new FormControl(""),
            organization: new FormControl("", [Validators.required]),
            purposeOfUse: new FormControl("", [Validators.required]),
            address1: new FormControl("", [Validators.required]),
            address2: new FormControl("", [Validators.required]),
            address3: new FormControl(""),
            stateOrProvince: new FormControl(""),
            zipCode: new FormControl(""),
            country: new FormControl("", [Validators.required]),
            receiveEmails: new FormControl(false),
            termsAndConditionsAgreenement: new FormControl(false, [
                Validators.required,
            ]),
            disclaimerAgreenement: new FormControl(false, [Validators.required]),
            vettingAgreenement: new FormControl(false, [Validators.required]),
            recaptcha: new FormControl(false, [Validators.required]),
        });
    }
    /**
     * Utility method that takes an AbstractControl or null and returns any validation errors that are present in the control or its child controls.
     * @param form the form to check
     * @returns  validation errors associated with the input control
     */
    private getFormErrors(form: AbstractControl | null): ValidationErrors | null | undefined {
        if (form instanceof FormControl) {
            // Return FormControl errors or null
            return form.errors ?? null;
        }
        if (form instanceof FormGroup) {
            const groupErrors = form.errors;
            // Form group can contain errors itself, in that case add'em
            const formErrors = groupErrors ? [groupErrors] : [];
            Object.keys(form.controls).forEach(key => {
                // Recursive call of the FormGroup fields
                const error = this.getFormErrors(form!.get(key));
                if (error !== null) {
                    // Only add error if not null
                    formErrors.push({
                        field: key,
                        error: error
                    });
                }
            });
            // Return FormGroup errors or null
            return Object.keys(formErrors).length > 0 ? formErrors : null;
        }
    }
}
