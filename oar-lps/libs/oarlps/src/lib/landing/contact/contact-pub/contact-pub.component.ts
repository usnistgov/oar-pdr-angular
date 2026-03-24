import { Component, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { ContactService } from '../contact.service';
import { Contact } from '../contact';
import { LandingpageService } from '../../landingpage.service';
import { CommonModule } from '@angular/common';
import { CollapseModule } from '../../collapseDirective/collapse.module';
import { Sections, SectionPrefs, GlobalService, iconClass } from '../../../shared/globals/globals';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faCaretDown,
    faCaretRight
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'contact-pub',
    standalone: true,
    imports: [
        CommonModule, 
        CollapseModule, 
        NgbModule,
        FontAwesomeModule
    ],
    templateUrl: './contact-pub.component.html',
    styleUrls: ['./contact-pub.component.scss', '../../landing.component.scss']
})
export class ContactPubComponent {
    currentContact: Contact = {} as Contact;
    fieldName = SectionPrefs.getFieldName(Sections.CONTACT);
    overflowStyle: string = 'hidden';
    isMouseOver: boolean = false;
    
    //icon class names
    caretRightIcon = iconClass.CARET_RIGHT;
    caretDownIcon = iconClass.CARET_DOWN;

    @Input() record: any[];
    @Input() isPublicSite: boolean = true;
    
    constructor(
        public globalsvc: GlobalService,
        public lpService: LandingpageService, 
        private chref: ChangeDetectorRef,
        private notificationService: NotificationService,
        public iconLibrary: FaIconLibrary,
        private contactService: ContactService) {
        
        iconLibrary.addIcons(
            faCaretDown,
            faCaretRight
        );  
    }

    email(hasEmail)
    {
        if(hasEmail == null || hasEmail == undefined)
            return "";

        let email = hasEmail.split(":");
        if(email && email.length <= 1)
            return email[0];
        else
            return email[1];
    }

    ngOnInit() {
        if(this.record) {
            this.currentContact = this.record[this.fieldName];
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(this.record) {
            this.currentContact = this.record[this.fieldName];
        }

        this.chref.detectChanges();
    }

    get hasContact() {
        if(!this.record) return false;
        else return !this.emptyContact(this.record[this.fieldName]);
    }

    get hasEmail() {
        return this.hasContact && this.currentContact && this.currentContact['hasEmail'];
    }

    emptyContact(contact) {
        if (contact == undefined || Object.keys(contact).length === 0) {
            return true;
        }

        return false;
    }

    clickContact = false;
    expandContact() {
        this.clickContact = !this.clickContact;
        return this.clickContact;
    }
}
