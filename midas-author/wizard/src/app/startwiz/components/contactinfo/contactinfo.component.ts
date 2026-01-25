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

    // Using dataModel for two way binding causes issues with laypout,
    // so we use local variables and update dataModel on change events.
    lastName: string = '';
    firstName: string = ''; 
    contactEmail: string = '';

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
        this.updateContact();
        this.cdr.detectChanges();
    }
       
    toggleContactName(evt:any) {
        if(this.dataModel.creatorIsContact) {
            this.dataModel.contact = undefined;

            this.thisStep.isComplete = true;
        } else {
            this.updateContact();
            this.thisStep.isComplete = false;
        }

        this.lastStep.canGoNext = this.stepService.allDone();
    }

    /**
     * Update local contact fields from data model
     */
    updateContact() {
        this.lastName = this.dataModel.contact?.lastName || '';
        this.firstName = this.dataModel.contact?.firstName || '';
        this.contactEmail = this.dataModel.contact?.email || '';   
    }

    /**
     * Update data model when a contact field is changed
     * @param field The field that changed (lastName, firstName, email)
     */
    onContactChanged(field: string) {
        if(!this.dataModel.contact) {
            this.dataModel.contact = {} as ContactDataModel;
        }

        switch(field) {
            case 'lastName':
                this.dataModel.contact.lastName = this.lastName;
                break;
            case 'firstName':
                this.dataModel.contact.firstName = this.firstName;
                break;
            case 'email':
                this.dataModel.contact.email = this.contactEmail;
                break;
            default:
                break;
        }

        this.thisStep.isComplete = (this.dataModel.contact.lastName != '' && this.dataModel.contact.firstName != '');
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
                    this.updateContact();

                    this.thisStep.isComplete = (this.dataModel.contact != undefined);
                    this.lastStep.canGoNext = this.stepService.allDone();                }
    
                break;                
            default:
                break;
        }
    }    
}
