import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css', '../../stepwizard.component.scss']
})
export class FilesComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Files");
        this.lastStep = this.stepService.getLastStep();
        this.setSteps();
    }

    setSteps() {
        if(this.dataModel.willUpload != undefined){
            this.thisStep.canGoNext = true;
            this.thisStep.isComplete = true;
        }else{
            this.thisStep.isComplete = false;
        }
        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
