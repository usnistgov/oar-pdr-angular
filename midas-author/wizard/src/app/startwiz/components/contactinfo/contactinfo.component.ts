import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { DataModel, ContactDataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

    sanitizedHtml: SafeHtml;

    // Using dataModel for two way binding causes issues with laypout,
    // so we use local variables and update dataModel on change events.
    name: string = '';
    email: string = '';

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;

    constructor(
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        let helpContent = this.stepService.iconHandler(this.helpText['general']);
        this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(helpContent);

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
        this.name = this.dataModel.contact?.name || '';
        this.email = this.dataModel.contact?.email || '';  
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
            case 'name':
                this.dataModel.contact.name = this.name;
                break;
            case 'email':
                this.dataModel.contact.email = this.email;
                break;
            default:
                break;
        }

        this.thisStep.isComplete = (this.dataModel.creatorIsContact || (!this.dataModel.creatorIsContact && this.dataModel.contact.name != ''));
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
                    this.dataModel.contact.name = this.selected.firstName + " " + this.selected.lastName;
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
