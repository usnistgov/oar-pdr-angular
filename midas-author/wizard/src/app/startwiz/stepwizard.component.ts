import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StepModel } from "./models/step.model";
import { DataModel } from './models/data.model';
import { StepService } from './services/step.service';
import { Subscription } from 'rxjs';
import { WizardService } from './services/wizard.service';
import { AppConfig } from 'oarlps';
import { UserMessageService } from 'oarlps';
import { AuthenticationService, Credentials, ConfigurationService } from 'oarng';
import { CollectionDataModel } from './models/data.model';

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
    private PDRAPI: string;
    nextBtnIcon: string = "faa faa-long-arrow-right icon-white";
    nextBtnText: string = "Next";

    authStatus: string = AuthStatus.AUTHORIZING;
    resid: string = "Wizard";
    authMessage: string = "Authorizing...";

    _creds: Credentials|null = null;
    hasError: boolean = false;

    collectionData: CollectionDataModel[] = [];

    constructor(private stepService: StepService,
                private msgsvc: UserMessageService,
                private cdr: ChangeDetectorRef,
                private wizardService: WizardService,
                private configSvc: AppConfig,
                public authService: AuthenticationService)
    {
        this.PDRAPI = this.configSvc.get('dapToolBase', "/dapui/edit/od/id/");
        if (! this.PDRAPI.endsWith("/"))
            this.PDRAPI += "/";
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
        this.collectionData = this.wizardService.getCollectionData();

        this.stepService.getCurrentStep().subscribe(currentStep => {
            this.showButtonLabel();
        })
    }

    /**
     * Authorizing...
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
                this.hasError = true;
            }
        })
    }

    stepDataReset(){
        this.steps = [];

        this.stepService.getSteps().subscribe(steps => {
            this.steps = steps;

            this.currentStep = this.steps[0];
            this.stepService.setCurrentStep(this.currentStep);
        })
    }

    reset(){
        this.stepDataReset();
        this.dataModel = {};
        this.showButtonLabel();
        this.hasError = false;
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    onNextStep() {
        if (!this.stepService.isLastStep()) {
            this.stepService.moveToNextStep();
            this.showButtonLabel();
        } else {
            this.onSubmit();
            this.nextBtnIcon = "faa faa-spinner faa-spin icon-white";
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

        this.showButtonLabel();
    }

    showButtonLabel() {
        this.nextBtnIcon = "faa faa-long-arrow-right icon-white";

        if(this.stepService.isLastStep()){
            this.nextBtnText = 'Finish';
        }else{
            this.nextBtnText = 'Next';
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe to avoid memory leaks and unexpected angular errors
        this.currentStepSub.unsubscribe();
    }

    onSubmit(): void {
        let id: string;

        // If partOfCollection flag is set but collection value is "None",
        // set the flag off and reset the collection value.
        if(this.dataModel.partOfCollection && this.dataModel.collections[0] == this.collectionData.find(c => c.id === 4).value) {
            this.dataModel.partOfCollection = false;
            this.dataModel.collections = [];
            this.stepService.toggleCollection(false);
        }

        let body = {
            // "name": this.readableRandomStringMaker(5),
            "name": this.dataModel.recordname,
            "meta": this.dataModel
        }

        this.wizardService.updateMetadata(body).subscribe({
            next: (obj) => {
                id = obj['id'];
                //Reset submit nutton icon
                this.nextBtnIcon = "faa faa-long-arrow-right icon-white";

                // Submit the request, get the id from server response then launch the landing page
                let url = this.PDRAPI + id + '?editEnabled=true';
                // window.location.href = url;
                window.open(url, "_self");
            },
            error: (err) => {
                console.error("err", err);
                this.hasError = true;
                this.nextBtnIcon = "faa faa-exclamation-triangle icon-orange";

                // err will be a subtype of CustomizationError
                if (err.type == 'user')
                {
                    console.error("Failed to retrieve draft metadata changes: user error:" + err.message);
                    this.msgsvc.error(err.message);
                }
                else
                {
                    console.error("Failed to retrieve draft metadata changes: server error:" + err.message);
                    this.msgsvc.syserror(err.message);
                }
            }
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
