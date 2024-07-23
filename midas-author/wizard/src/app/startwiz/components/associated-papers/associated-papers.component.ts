import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
  selector: 'app-associated-papers',
  templateUrl: './associated-papers.component.html',
  styleUrls: ['./associated-papers.component.css', '../../stepwizard.component.scss']
})
export class AssociatedPapersComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private chref: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Associated Papers");
        this.lastStep = this.stepService.getLastStep();
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    onSelectChange(evt: any) {
        if(this.dataModel.assocPageType != undefined){
            this.thisStep.canGoNext = true;
            this.thisStep.isComplete = true;
        }else{
            this.dataModel.assocPageType = undefined;
            this.thisStep.isComplete = false;
        }

        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
