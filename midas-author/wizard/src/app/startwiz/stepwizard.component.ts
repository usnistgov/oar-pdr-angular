import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StepModel } from "./models/step.model";
import { DataModel } from './models/data.model';
import { StepService } from './services/step.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators, FormBuilder, FormGroupDirective} from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { WizardService } from './services/wizard.service';
import { AppConfig, Config } from './services/config-service.service';
import { AuthenticationService, Credentials } from 'oarng';

export class AuthStatus {
    static readonly AUTHORIZED = 'Authorized';
    static readonly AUTHENTICATED = 'Authenticated';
    static readonly NOTLOGIN = 'NotLoggedIn';
    static readonly AUTHORIZING = 'Authorizing';
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
    selector: 'app-wizard',
    templateUrl: './stepwizard.component.html',
    styleUrls: ['./stepwizard.component.scss'],
    providers: [FormGroupDirective],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class StepWizardComponent implements OnInit {
    steps: StepModel[] = [];
    currentStep: StepModel = {} as StepModel;
    dataModel: DataModel = {} as DataModel;
    currentStepSub!: Subscription;
    onSoftware: boolean = false;
    bodyHeight: number = 550;
    confValues: Config;
    private PDRAPI: string;

    fgSteps!: FormGroup;

    authStatus: string = AuthStatus.AUTHORIZING;
    resid: string = "Wizard";
    authMessage: string = "Authorizing...";

    _creds: Credentials|null = null;

    constructor(private stepService: StepService,
                private fb: FormBuilder, 
                private cdr: ChangeDetectorRef,
                private router: Router,
                private wizardService: WizardService,
                private appConfig: AppConfig,
                private route: ActivatedRoute,
                private authService: AuthenticationService) { 

            this.confValues = this.appConfig.getConfig();
            this.PDRAPI = this.confValues.PDRAPI;
            console.log('this.PDRAPI', this.PDRAPI);
    }

    get isAuthorized() {
        return this.authStatus == AuthStatus.AUTHORIZED;
    }

    get isAuthenticated() {
        return this.authStatus == AuthStatus.AUTHENTICATED;
    }

    get notLoggedin() {
        return this.authStatus == AuthStatus.NOTLOGIN;
    }

    get authorizing() {
        return this.authStatus == AuthStatus.AUTHORIZING;
    }

    ngOnInit(): void {
        this.authorizeEditing();
    }

    /**
     * 
     */
    authorizeEditing() {
        this.authService.getCredentials().subscribe({
            next: (creds) =>{
                if (creds && creds.token) {
                    this._creds = creds;
                    this.wizardService.setToken(creds.token);
                    this.authStatus = AuthStatus.AUTHORIZED;

                    this.reset();

                    this.currentStepSub = this.stepService.getCurrentStep().subscribe((step: StepModel) => {
                        this.currentStep = step;
                    });
            
                    this.bodyHeight = window.innerHeight - 150;
                }
                else if (creds && creds.userAttributes && creds.userId) {
                    // the user is authenticated but not authorized
                    this.authStatus = AuthStatus.AUTHENTICATED;
                }
                else {
                    // the user is not authenticated!
                    this.authStatus = AuthStatus.NOTLOGIN;
                }
            },
            error: (err) => {
                this.authStatus = AuthStatus.NOTLOGIN;
                this.authMessage = err['message'];
            }
        })
    }

    formGroupReset() {
        this.fgSteps = this.fb.group({
            'pubtype': this.fb.group({
                resourceType: [""]
            }),
            'softwareInfo': this.fb.group({
                provideLink: [false],
                softwareLink: [""]
            }),
            'contactInfo': this.fb.group({
                creatorIsContact: [true],
                contactName: [""]
            }),
            'files': this.fb.group({
                willUpload: [true]
            }),
            'assocPapers': this.fb.group({
                assocPageType: [""]
            })
        });
    }

    stepDataReset(){
        this.steps = [];

        this.steps = [
            new StepModel(1, 'Publication Type',true,true,false,false),
            new StepModel(2, 'Contact Info',true,false),
            new StepModel(3, 'Files',true,false),
            new StepModel(4, 'Software',false,false),
            new StepModel(5, 'Associated Papers',true,false,false)
        ]

        this.currentStep = this.steps[0];
        this.stepService.setSteps(this.steps);
        this.stepService.setCurrentStep(this.currentStep);
    }

    reset(){
        this.formGroupReset();
        this.stepDataReset();
        this.dataModel = {};
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    onNextStep() {
        console.log("Next")
        if (!this.stepService.isLastStep()) {
            this.stepService.moveToNextStep();
        } else {
            this.onSubmit();
        }
    }

    get isFirstStep() {
        return this.stepService.isFirstStep();
    }

    get isLastStep() {
        return this.stepService.isLastStep();
    }

    onPrevStep() {
        if (!this.isFirstStep) {
            this.stepService.moveToPrevStep();
        }
    }

    showButtonLabel() {
        // return "continue";
        return !this.stepService.isLastStep() ? 'Next' : 'Finish';
    }

    ngOnDestroy(): void {
        // Unsubscribe to avoid memory leaks and unexpected angular errors
        this.currentStepSub.unsubscribe();
    }

    onSubmit(): void {
        // this.router.navigate(['/complete']);
        console.log('this.dataModel', JSON.stringify(this.dataModel));

        let id: string;
        let body = {
            "name": this.readableRandomStringMaker(5),
            "meta": this.dataModel
        }

        this.wizardService.updateMetadata(body)
        .subscribe(obj => {
            console.log(obj);
            id = obj['id'];

            // Submit the request, get the id from server response then launch the landing page
            let url = this.PDRAPI + id + '?editEnabled=true';
            console.log("Open publishing url", url);
            // window.location.href = url;
            window.open(url, "_blank");
        });
    }

    /**
     * Generate random string
     * @param length Length of the output string
     * @returns random string
     */
    readableRandomStringMaker(length: number) {
        for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
        return s;
    }

    onResize(event: any){
        // console.log(window.innerHeight)
        this.bodyHeight = window.innerHeight - 150;
    }

    onCancel() {
        this.reset();
        this.steps = this.steps.slice(0);
    }
}
