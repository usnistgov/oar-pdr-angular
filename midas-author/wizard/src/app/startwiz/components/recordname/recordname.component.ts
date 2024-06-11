import { Component, Input, ChangeDetectorRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
  selector: 'app-recordname',
  templateUrl: './recordname.component.html',
  styleUrls: ['./recordname.component.css', '../../stepwizard.component.scss']
})
export class RecordNameComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    
    constructor(
        private cdr: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Name");
        this.lastStep = this.stepService.getLastStep();
    }

    updateRecordName(evt:any) {
        this.thisStep.isComplete = (this.dataModel.recordname?.trim() != "");
        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
