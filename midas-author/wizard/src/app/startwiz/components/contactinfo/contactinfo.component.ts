import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel, ContactDataModel } from '../../models/data.model';
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
    // the full record for the selected person
    selected: any = null;

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
            this.dataModel.contact = undefined;

            this.thisStep.isComplete = true;
        }else{
            this.thisStep.isComplete = false;
        }

        this.lastStep.canGoNext = this.stepService.allDone();
    }

    /**
     * Handle requests from child component - when contact info changed,
     * update dataModel and step completion status.
     * @param dataChanged parameter passed from child component
     */
    onDataChanged(dataChanged: any) {
        switch(dataChanged.action) {
            case 'peopleChanged':
                this.selected = dataChanged.selectedPeopleRecord;
                if (this.selected.lastName && this.selected.firstName) {
                    this.dataModel.contact = {} as ContactDataModel;
                    this.dataModel.contact.lastName = this.selected.lastName;
                    this.dataModel.contact.firstName = this.selected.firstName;
                    this.dataModel.contact.email = this.selected.emailAddress;

                    this.thisStep.isComplete = (this.dataModel.contact != undefined);
                    this.lastStep.canGoNext = this.stepService.allDone();                }
    
                break;                
            default:
                break;
        }
    }    
}
