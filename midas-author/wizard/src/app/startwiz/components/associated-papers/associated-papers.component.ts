import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-associated-papers',
  templateUrl: './associated-papers.component.html',
  styleUrls: ['./associated-papers.component.css', '../../stepwizard.component.scss']
})
export class AssociatedPapersComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    sanitizedHtml: SafeHtml;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private chref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Associated Papers");
        this.lastStep = this.stepService.getLastStep();

        let helpContent = this.stepService.iconHandler(this.helpText['general']);
        this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(helpContent);
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    /**
     * Update the step status when associated paper type changed.
     */    
    onAssocPaperTypeChange() {
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
