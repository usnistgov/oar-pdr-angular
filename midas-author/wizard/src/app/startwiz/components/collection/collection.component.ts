import { Component, Input, OnInit } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { CollectionDataModel } from '../../models/data.model';
import { WizardService } from '../../services/wizard.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css', '../../stepwizard.component.scss']
})
export class CollectionComponent implements OnInit {
    thisStep: StepModel;
    lastStep: StepModel;
    collectionData: CollectionDataModel[] = [];

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private stepService: StepService,
        private wizardService: WizardService
    ) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Collection");
        this.lastStep = this.stepService.getLastStep();
        this.collectionData = this.wizardService.getCollectionData();
        if(!this.dataModel.collections) {
            this.dataModel.collections = [];
        }
    }

    /**
     * Update the step status when collection changed.
     */    
    onSelectChange(evt: any) {
        this.thisStep.canGoNext = true;
        this.thisStep.isComplete = true;

        this.lastStep.canGoNext = this.stepService.allDone();
    }
}
