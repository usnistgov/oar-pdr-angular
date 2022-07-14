import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StepModel } from "./models/step.model";
import { DataModel } from './models/data.model';
import { StepService } from './services/step.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators, FormBuilder, FormGroupDirective} from '@angular/forms';

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

    fgSteps!: FormGroup;

    constructor(
        private stepService: StepService,
        private fb: FormBuilder, 
        private cdr: ChangeDetectorRef
    ) { 

    }

    ngOnInit(): void {
        this.reset();

        this.currentStepSub = this.stepService.getCurrentStep().subscribe((step: StepModel) => {
            this.currentStep = step;
        });

        this.bodyHeight = window.innerHeight - 150;
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
            new StepModel(4, 'Optional',false,false),
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
        } else {
            this.onSubmit();
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
