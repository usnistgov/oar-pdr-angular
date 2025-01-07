import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ContactService } from './contact.service';
import { Contact } from './contact';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { CommonModule } from '@angular/common';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../shared/globals/globals';
import { PeopleComponent } from '../people/people.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditStatusService } from '../editcontrol/editstatus.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [ 
        CommonModule, 
        CollapseModule, 
        ContactEditComponent, 
        PeopleComponent, 
        NgbModule 
    ],
    providers: [ ContactService ],
    templateUrl: './contact.component.html',
    styleUrls: ['../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class ContactComponent implements OnInit {
    currentContact: Contact = {} as Contact;
    originalRecord: any = {};
    fieldName = SectionPrefs.getFieldName(Sections.CONTACT);
    editMode: string = MODE.NORNAL; 

    tempInput: any = {};

    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';
    backgroundColor: string = 'var(--editable)'; // Background color of the text edit area
    dataChanged: boolean = false;

    LoadEditComp: boolean = false;
    isPublicSite: boolean = false; 

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    @ViewChild('contactedit') contactEdit: ContactEditComponent;
    
    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal,
                public edstatsvc: EditStatusService,
                private gaService: GoogleAnalyticsService,
                public globalsvc: GlobalService,
                public lpService: LandingpageService, 
                private chref: ChangeDetectorRef,
                private notificationService: NotificationService,
                private contactService : ContactService)
    {
        this.lpService.watchEditing((sectionMode: SectionMode) => {
            if(sectionMode){
                if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                    if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                        if(this.isEditing && this.currentContact.dataChanged){
                            this.saveCurrentContact(false); // Do not refresh help text 
                        }
                        this.hideEditBlock(false);
                    }
                }else{
                    if(!this.isEditing && sectionMode.section == this.fieldName && this.edstatsvc.isEditMode()) {
                        this.startEditing();
                    }
                }
            }
        })
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

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
        this.isPublicSite = this.globalsvc.isPublicSite();
        this.updateOriginal();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record) {
            setTimeout(() => {
                this.updateOriginal();
            }, 0);
        }
    }

    updateOriginal(){
        if(this.hasContact) {
            this.currentContact = JSON.parse(JSON.stringify(this.record[this.fieldName]));
            this.currentContact.dataChanged = false;

            this.originalRecord[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        }else{
            if(this.record[this.fieldName] == undefined){
                this.originalRecord[this.fieldName] = undefined;
                this.currentContact = {} as Contact;
            }else{
                this.originalRecord[this.fieldName] = {} as Contact;
                this.currentContact = {} as Contact;
            }
        }
    }

    get hasContact() {
        if(!this.record) return false;
        else return !this.emptyContact(this.record[this.fieldName]);
    }

    get hasEmail() {
        return this.hasContact && this.currentContact && this.currentContact['hasEmail'];
    }

    get isEditing() { return this.editMode==MODE.EDIT }

    get isNormal() { return this.editMode==MODE.NORNAL }

    /**
     * Retuen background color of the whole record (the container of all authors) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    get getRecordBackgroundColor() {
        if(this.edstatsvc.isEditMode()){
            this.backgroundColor = 'var(--editable)';
            
            if(this.mdupdsvc.fieldUpdated(this.fieldName)){
                this.backgroundColor = 'var(--data-changed-saved)';
            }
            
            if(this.dataChanged){
                this.backgroundColor = 'var(--data-changed)';
            }
        }else{
            this.backgroundColor = 'white';
        }

        return this.backgroundColor;
    }

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */    
    setOverflowStyle() {
        if(this.editBlockStatus == 'collapsed') {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }

    startEditing() {
        this.LoadEditComp = true;

        if(this.record[this.fieldName])
            this.currentContact = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        else
            this.currentContact = {} as Contact;

        this.setMode(MODE.EDIT);
        this.chref.detectChanges();
    }

    emptyContact(contact) {
        if (contact == undefined || Object.keys(contact).length === 0) {
            return true;
        }

        return false;
    }

    hideEditBlock(refreshHelp: boolean = true) {
        this.setMode(MODE.NORNAL, refreshHelp);
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onContactChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'dataChanged':
                this.dataChanged = true;
                break;

            default:
                break;
        }
    }

    /**
     * Unde current changes on contact
     */
    undoCurContactChanges() {
        if(this.originalRecord[this.fieldName] == undefined) {
            this.record[this.fieldName] = undefined;
            this.currentContact = {} as Contact;
        }else if(this.emptyContact(this.originalRecord[this.fieldName])){
            this.record[this.fieldName] = {} as Contact;
            this.currentContact = {} as Contact;
        }else{
            this.record[this.fieldName] = JSON.parse(JSON.stringify(this.originalRecord[this.fieldName]));
            this.currentContact = JSON.parse(JSON.stringify(this.originalRecord[this.fieldName]));
        }

        this.setMode(MODE.NORNAL, true);
        this.chref.detectChanges();
    }

    /**
     * Close edit block. If is editing, save change first.
     */
    closeEditBlock() {
        if(this.isEditing && this.dataChanged){
            this.saveCurrentContact();
        }

        this.setMode(MODE.NORNAL, true);
    }

    /**
     * Determind the edit icon class based on current editing status
     * @returns icon class of the edit button
     */
    editIconClass() {
        if(this.isEditing){
            return "fas fa-pencil icon_disabled";
        }else{
            return "fas fa-pencil icon_enabled"
        }
    }

    /**
     * Refresh the help text
     */
    refreshHelpText(){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];
        this.lpService.setSectionHelp(sectionHelp);
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            this.refreshHelpText();
        }
            
        switch ( this.editMode ) {
            case MODE.EDIT:
                this.editBlockStatus = 'expanded';
                this.setOverflowStyle();
                break;
 
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.currentContact.dataChanged = false;
                this.setOverflowStyle();
                this.dataChanged = false;
                break;
        }

        // this.getRecordBackgroundColor();
        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    getFieldStyle() {
        return this.mdupdsvc.getFieldStyle(this.fieldName);
    }
    
    /**
     * Save current contact to the server
     */    
    saveCurrentContact(refreshHelp: boolean = true) {
        var postMessage: any = {};
        postMessage[this.fieldName] = JSON.parse(JSON.stringify(this.currentContact));
        // console.log('postMessage', JSON.stringify(postMessage));
        
        this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
            if (updateSuccess){
                this.setMode(MODE.NORNAL, refreshHelp);
                this.chref.detectChanges();
                this.notificationService.showSuccessWithTimeout("Title updated.", "", 3000);
            }else{
                let msg = "Contact update failed.";
                console.error(msg);
            }
        });
    }

    /**
     * Update author data to the server
     */
    updateMatadata(contact: Contact = undefined) {
        return new Promise<boolean>((resolve, reject) => {
            var postMessage: any = {};
            postMessage[this.fieldName] = JSON.parse(JSON.stringify(contact));
            // console.log("postMessage", JSON.stringify(postMessage));
            this.record[this.fieldName] = JSON.parse(JSON.stringify(contact));
            
            this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                if (updateSuccess){
                    this.notificationService.showSuccessWithTimeout("Contact updated.", "", 3000);
                    resolve(true);
                }else{
                    let msg = "Contact update failed";
                    console.error(msg);
                    resolve(false);
                }
            });
        })
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode();
                this.chref.detectChanges();
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else{
                let msg = "Failed to restore original value."
                console.error(msg);
            }
        });
    }

    clickContact = false;
    expandContact() {
        this.clickContact = !this.clickContact;
        return this.clickContact;
    }
}
