import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Contact } from '../contact';

@Component({
  selector: 'lib-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit {
    // the full record for the selected person
    selected: any = null;

    // the organizations that the selected person is a member of
    selectedOrgs: any[]|null = null;

    json = JSON;
    email: string = "";

    @Input() contact: Contact = {} as Contact;
    @Input() backgroundColor: string = 'var(--editable)';
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();    
    
    constructor() { }

    ngOnInit(): void {
        this.convertEmail();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.contact) {
            this.convertEmail();
        }
    }

    convertEmail() {
        this.email = this.contact.hasEmail? this.contact.hasEmail.replace("mailto:", "").trim() : "";
    }

    onFullNameChange(value) {
        this.contact.dataChanged = true;
        this.dataChanged.next({"fn": JSON.parse(JSON.stringify(this.contact.fn)), action:"dataChanged"});
    }

    onEmailChange(value) {
        this.contact.hasEmail = "mailto:" + value;
        this.contact.dataChanged = true;
        this.dataChanged.next({"email": JSON.parse(JSON.stringify(this.contact.hasEmail)), action:"dataChanged"});
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onDataChanged(dataChanged: any) {
        switch(dataChanged.action) {
            case 'fieldChanged':
                // this.contact.dataChanged = true;
                // this.contact.fn = dataChanged.value;
                // this.dataChanged.next({"fn": this.contact.fn, action:"dataChanged"});
    
                break;

            case 'peopleChanged':
                this.selected = dataChanged.selectedPeopleRecord;
                if(this.selected.lastName && this.selected.firstName){
                    this.contact.fn = this.selected.lastName + ", " + this.selected.firstName;

                    this.contact.dataChanged = true;
                    this.dataChanged.next({"fn": JSON.parse(JSON.stringify(this.contact.fn)), action:"dataChanged"});
                }

                if(this.selected.lastName)
                    this.contact.familyName = this.selected.lastName;

                if(this.selected.firstName)
                    this.contact.givenName = this.selected.firstName;

                if(this.selected.emailAddress){
                    this.contact.hasEmail = "mailto:" + this.selected.emailAddress;
                    this.email = this.selected.emailAddress;

                    this.contact.dataChanged = true;
                    this.dataChanged.next({"email": JSON.parse(JSON.stringify(this.contact.hasEmail)), action:"dataChanged"});
                }
    
                break;                
            default:
                break;
        }
    }

}
