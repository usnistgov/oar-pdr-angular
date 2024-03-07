import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Contact } from '../contact';

@Component({
  selector: 'lib-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit {
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
}
