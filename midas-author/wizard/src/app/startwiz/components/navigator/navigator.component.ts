import { Component, Input, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'wiz-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavigatorComponent implements OnInit {
    currentStep!: StepModel;

    @Input() steps: StepModel[] = [];

    constructor(private stepService: StepService) { }

    ngOnInit(): void {
        // this.updateNavigator();
        // this.steps = this.stepService.getSteps();
        this.stepService.getCurrentStep().subscribe(step => {
            this.currentStep = step;
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        // this.updateNavigator();
    }

    getStepClass(step: StepModel) {
        let returnClass = "step-incomplete";

        if(!step.canEnter) {
            returnClass = "step-disabled";
        }else if(step.isComplete) {
            returnClass = "step-complete"
        }else if(this.currentStep.stepIndex === step.stepIndex) {
            returnClass = "step-current";
        }else{
            returnClass = "step-incomplete";
        }

        return returnClass;
    }

    onStepClick(step: StepModel) {
        if(step.canEnter)
            this.stepService.setCurrentStep(step);
    }

    titleStyle(index: number) {
        if(index == 0)
            return {'margin-left': '-80px'};
        else if(index == this.steps.length-1)
            return {'margin-right': '-80px'};
        else
            return {'margin-left': '0px'};
    }

    /**
     * Calculate the length of a string
     * @param str input string
     * @param fontSize font size
     * @returns length of the string
     */
    measureText(str: string, fontSize = 10) {
        const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625]
        const avg = 0.5279276315789471
        return str
          .split('')
          .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
          .reduce((cur, acc) => acc + cur) * fontSize
    }
}
