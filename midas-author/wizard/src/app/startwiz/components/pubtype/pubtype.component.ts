import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
    selector: 'app-pubtype',
    templateUrl: './pubtype.component.html',
    styleUrls: ['./pubtype.component.css', '../../stepwizard.component.scss']
})
export class PubtypeComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;
    softwareStep: StepModel;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private chref: ChangeDetectorRef,
        private stepService: StepService) { 
        
    }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Publication Type");
        this.softwareStep = this.stepService.getStep("Software");
        this.lastStep = this.stepService.getLastStep();

        if(this.dataModel.resourceType == undefined){
            for(let i = 1; i < this.steps.length; i++){
                this.steps[i].canEnter = false;
            }
            this.dataModel.resourceType = undefined;
            this.thisStep.isComplete = false;
        }
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    /**
     * Set other steps' status based on user selection:
     * Upon user select any option, all steps become active.
     * If user select "Software", the "Software" step shows up. Otherwise "Software" step is hidden.
     * If all steps are completed, the "Finish" button in the last step will be enabled.
     * @param evt Not used
     */
    onSelectChange(evt: any) {
        this.thisStep.canGoNext = true;
        this.thisStep.isComplete = true;
        for(let i = 1; i < this.steps.length; i++){
            this.steps[i].canEnter = true;
        }

        // Turn on optional step if resource type is software
        this.softwareStep.active = (this.dataModel.resourceType == "software");

        this.lastStep.canGoNext = this.stepService.allDone();
    }

    /**
     * Show or hide collection step based on the value of partOfCollection
     */
    toggleCollection() {
        this.stepService.toggleCollection(this.dataModel.partOfCollection);
    }
}
