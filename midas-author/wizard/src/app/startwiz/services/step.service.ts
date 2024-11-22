import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StepModel } from '../models/step.model';

// When adding new steps, append it to the end. Do not change the existing step data
// If you need to change the order of the steps, change STEP_ORDER.
const STEPS = [
    new StepModel(1, 'Publication Type',true,true,false,false),
    new StepModel(2, 'Contact Info',true,false),
    new StepModel(3, 'Files',true,false),
    new StepModel(4, 'Software',false,false),
    new StepModel(5, 'Associated Papers',true,false),
    new StepModel(6, 'Name',true,false),
    new StepModel(7, 'Collection',false,false)
];

// This is where we define the order of steps
const STEP_ORDER: number[] = [1, 7, 2, 3, 4, 5, 6]; 

@Injectable({
    providedIn: 'root'
})
export class StepService {

    steps$: BehaviorSubject<StepModel[]> = new BehaviorSubject<StepModel[]>(STEPS);
    currentStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(STEPS[1]);
    stepOrder$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(STEP_ORDER);

    constructor() { 
        this.currentStep$.next(this.steps$.value[0]);
    }

    getStepOrder(): Observable<number[]> {
        return this.stepOrder$.asObservable();
    }

    setCurrentStep(step: StepModel): void {
        this.currentStep$.next(step);
    }

    /**
     * Return current step as observable
     * @returns current step
     */
    getCurrentStep(): Observable<StepModel> {
        return this.currentStep$.asObservable();
    }

    /**
     * Return particular step by title
     * @param title step title
     * @returns 
     */
    getStep(title: string): StepModel {
        return this.steps$.value.find(i => i.title.trim() == title.trim());
    }

    /**
     * Return the last step
     * @returns last step
     */
    getLastStep(): StepModel {
        return this.steps$.value.find(i => i.stepIndex === STEP_ORDER[STEP_ORDER.length - 1]);
    }

    getSteps(): Observable<StepModel[]> {
        return this.steps$.asObservable();
    }

    /**
     * Set the steps. Then update all the status.
     * @param steps 
     */
    setSteps(steps:StepModel[]): void {
        this.steps$.next(steps);

        this.getLastStep().canGoNext = this.allDone();
    }

    moveToPrevStep(): void {
        let prevStep: StepModel;
        //Get current step index number
        let index = this.currentStep$.value.stepIndex;

        //Find the index in the step order array
        let stepOrderIndex = STEP_ORDER.indexOf(index) - 1;

        //Get next index from stepOrder array
        while(stepOrderIndex >= 0) {
            prevStep = this.steps$.value.find(i => i.stepIndex == STEP_ORDER[stepOrderIndex]);

            if(prevStep.active){
                this.currentStep$.next(prevStep);
                break;
            }else{
                stepOrderIndex--;
            }
        }
    }

    moveToNextStep(): void {
        let nextStep: StepModel;
        //Get current step index number
        let index = this.currentStep$.value.stepIndex;

        //Find the index in the step order array
        let stepOrderIndex = STEP_ORDER.indexOf(index) + 1;

        //Get next index from stepOrder array
        while(stepOrderIndex < STEP_ORDER.length) {
            nextStep = this.steps$.value.find(i => i.stepIndex == STEP_ORDER[stepOrderIndex]);
            if(nextStep.active){
                this.currentStep$.next(nextStep);
                break;
            }else{
                stepOrderIndex++;
            }
        }
    }

    isLastStep(): boolean {
        return this.currentStep$.value.stepIndex === STEP_ORDER[STEP_ORDER.length-1];
    }

    isFirstStep(): boolean {
        return this.currentStep$.value.stepIndex === 1;
    }

    /**
     * Determine if all steps are completed
     * @returns completion status
     */
    allDone():boolean {
        let allDone = true;

        for(let i=0; i<this.steps$.value.length; i++) {
            if(this.steps$.value[i] == undefined) {
                allDone = false;
                break;
            }else if(this.steps$.value[i].active) {
                allDone = allDone && this.steps$.value[i].isComplete;
                if(!allDone) break;
            }
        }

        return allDone;
    }

    toggleCollection(active: boolean) {
        let collectionStep = this.steps$.value.find(i => i.title == "Collection");

        if(collectionStep) {
            collectionStep.active = active;
        }

        this.getLastStep().canGoNext = this.allDone();
    }
}
