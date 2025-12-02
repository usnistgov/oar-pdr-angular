import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
    selector: 'app-contactinfo',
    templateUrl: './contactinfo.component.html',
    styleUrls: ['./contactinfo.component.css', '../../stepwizard.component.scss']
})
export class ContactinfoComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private cdr: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Contact Info");
        this.lastStep = this.stepService.getLastStep();
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    ngAfterContentInit() {
        this.cdr.detectChanges();
    }

    toggleContactName(evt:any) {
        if(this.dataModel.creatorIsContact) {
            this.dataModel.contactName = undefined;

            this.thisStep.isComplete = true;
        }else{
            this.thisStep.isComplete = false;
        }

        this.lastStep.canGoNext = this.stepService.allDone();
    }

    /**
     * Update the step status when contact name changed.
     */
    onContactNameChanged() {
        this.thisStep.isComplete = (this.dataModel.contactName?.trim() != "");
        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
