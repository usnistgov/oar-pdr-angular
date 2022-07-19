import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StepModel } from '../models/step.model';

const STEPS = [
    new StepModel(1, "step1"),
    new StepModel(2, "step2"),
    new StepModel(3, "step3")
];

@Injectable({
    providedIn: 'root'
})
export class StepService {

    steps$: BehaviorSubject<StepModel[]> = new BehaviorSubject<StepModel[]>(STEPS);
    currentStep$: BehaviorSubject<StepModel> = new BehaviorSubject<StepModel>(STEPS[1]);

    constructor() { 
        this.currentStep$.next(this.steps$.value[0]);
    }

    setCurrentStep(step: StepModel): void {
        this.currentStep$.next(step);
    }

    getCurrentStep(): Observable<StepModel> {
        return this.currentStep$.asObservable();
    }

    getSteps(): Observable<StepModel[]> {
        return this.steps$.asObservable();
    }

    setSteps(steps:StepModel[]): void {
        this.steps$.next(steps);
    }

    moveToPrevStep(): void {
        let index = this.currentStep$.value.stepIndex - 2;

        while(!this.steps$.value[index].active && index > 0) {
            index--;
        }

        if (index >= 0) {
            this.currentStep$.next(this.steps$.value[index]);
        }
    }

    moveToNextStep(): void {
        let index = this.currentStep$.value.stepIndex;

        while(!this.steps$.value[index].active && index < this.steps$.value.length) {
            index++;
        }

        if (index < this.steps$.value.length) {
            this.currentStep$.next(this.steps$.value[index]);
        }
    }

    isLastStep(): boolean {
        return this.currentStep$.value.stepIndex === this.steps$.value.length;
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


}
