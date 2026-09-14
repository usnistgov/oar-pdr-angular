import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-softwareinfo',
    templateUrl: './softwareinfo.component.html',
    styleUrls: ['./softwareinfo.component.css', '../../stepwizard.component.scss']
})
export class SoftwareinfoComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;

    sanitizedHtml: SafeHtml;
    
    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private sanitizer: DomSanitizer,
        private chref: ChangeDetectorRef,
        private stepService: StepService) { 
        
    }

    ngOnInit(): void {
        let helpContent = this.stepService.iconHandler(this.helpText['general']);
        this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(helpContent);

        this.thisStep = this.stepService.getStep("Software");
        this.lastStep = this.stepService.getLastStep();
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    toggleSoftwareLink(evt:any) {
        if(!this.dataModel.provideLink) {
            this.dataModel.softwareLink = undefined;

            this.thisStep.isComplete = true;
        }else{
            this.thisStep.isComplete = false;
        }

        this.lastStep.canGoNext = this.stepService.allDone();
    }

    /**
     * Update the step status when software link changed.
     */
    onSoftwareLinkChanged(): void {
        this.thisStep.isComplete = (this.dataModel.softwareLink?.trim() != "");
        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
