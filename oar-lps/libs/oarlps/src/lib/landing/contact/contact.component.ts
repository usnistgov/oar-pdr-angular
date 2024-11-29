import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ViewContainerRef, inject, ComponentFactoryResolver } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ContactService } from './contact.service';
import { Contact } from './contact';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';
import { ContactEditComponent } from './contact-edit/contact-edit.component';

@Component({
    selector: 'app-contact',
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
    clickContact = false;
    closeContent = true;

    tempInput: any = {};

    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';
    backgroundColor: string = 'var(--editable)'; // Background color of the text edit area
    dataChanged: boolean = false;

    contactEditComp: any;
    vcr = inject(ViewContainerRef);

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    // @ViewChild('contactedit') contactEdit: ContactEditComponent;
    // @ViewChild('contactedit', { read: ViewContainerRef, static: true })
    // private greetviewcontainerref: ViewContainerRef | undefined;

    @ViewChild('contactedit', { read: ViewContainerRef, static: true })
    private contactEditViewContainerRef: ViewContainerRef | undefined;

    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal,
                private gaService: GoogleAnalyticsService,
                public lpService: LandingpageService, 
                private notificationService: NotificationService,
                private contactService : ContactService,
                private vcref: ViewContainerRef)
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
                    if(!this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
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

    /**
     * Remove "mailto:" from the input string and return the email part.
     * @param hasEmail Nerdm record hasEmail field
     * @returns 
     */
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
        this.updateOriginal();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record) {
            setTimeout(() => {
                this.updateOriginal();
            }, 0);
        }
    }

    /**
     * Update the original record for undo purpose.
     */
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

    /**
     * Indicate if this record has contact info.
     */
    get hasContact() {
        if(!this.record) return false;
        else return !this.emptyContact(this.record[this.fieldName]);
    }

    /**
     * Indicate if this record has email.
     */
    get hasEmail() {
        return this.hasContact && this.currentContact && this.currentContact['hasEmail'];
    }

    /**
     * Indicate if we are in edit mode.
     */
    get isEditing() { return this.editMode==MODE.EDIT }

    /**
     * Indicate if we are in nornmal mode.
     */
    get isNormal() { return this.editMode==MODE.NORNAL }

    /**
     * Retuen background color of the whole record (the container of all authors) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    get getRecordBackgroundColor() {
        if(this.mdupdsvc.isEditMode){
            this.backgroundColor = 'var(--editable)';
            
            if(this.mdupdsvc.fieldUpdated(this.fieldName)){
                this.backgroundColor = 'var(--data-changed-saved)';
            }else if(this.currentContact.dataChanged){
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

    /**
     * Start editing:
     * Load edit component if not yet.
     * Then init edit component and expand it.
     */
    startEditing() {
    // Load edit component if not yet
        if(!this.contactEditComp) {
            this.vcr.clear();
            import('./contact-edit/contact-edit.component').then(
                ({ ContactEditComponent }) => {
                    this.contactEditComp = this.contactEditViewContainerRef?.createComponent(
                        ContactEditComponent);

                    this.showEditComp();
                }
            )
        }else{
            this.showEditComp();
        }
    }

    /**
     * Initialize the edit component;
     * Set current contact;
     * Then show the edit component.
     */
    showEditComp(){
        if (this.contactEditComp) {
            this.contactEditComp.instance.contact = this.currentContact;
            this.contactEditComp.instance.backgroundColor = this.getRecordBackgroundColor;
            this.contactEditComp.instance.editMode = this.editMode;
            this.contactEditComp.instance.forceReset = false;
            this.contactEditComp.instance.dataChanged.subscribe((data:any)=>{
              console.log(data);
              this.onContactChange(data);
            })
        }  

        if(this.record[this.fieldName])
            this.currentContact = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        else
            this.currentContact = {} as Contact;

        this.setMode(MODE.EDIT);
    }

    /**
     * Determine if the input contact object is empty.
     * @param contact 
     * @returns 
     */
    emptyContact(contact) {
        if (contact == undefined || Object.keys(contact).length === 0) {
            return true;
        }

        return false;
    }

    /**
     * Set edit mode to normal. Hide edit block.
     * @param refreshHelp If the help box needs be refreshed. 
     */
    hideEditBlock(refreshHelp: boolean = true) {
        this.setMode(MODE.NORNAL, refreshHelp);
    }

    /**
     * Handle requests from child component:
     * Update current contact object and set dataChanged flag.
     * @param dataChanged object passed from child component:
     * Action: fnChanged - fn field changed.
     * Action: emailChanged - email field changed.
     */
    onContactChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'fnChanged':
                this.currentContact.fn = dataChanged.fn;
                this.dataChanged = true;
                this.currentContact.dataChanged = true;
                this.contactEditComp.instance.backgroundColor = this.getRecordBackgroundColor;
                break;
            case 'emailChanged':
                this.currentContact.hasEmail = dataChanged.email;
                this.dataChanged = true;
                this.currentContact.dataChanged = true;
                this.contactEditComp.instance.backgroundColor = this.getRecordBackgroundColor;
                break;
    
            default:
                break;
        }
    }

    /**
     * Unde current changes on contact. Restore from original record.
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
     * Set the GUI to different mode:
     * Edit mode: expand the edit bloack.
     * Normal mode: hide the edit block.
     * @param editmode edit mode to be set
     * @param refreshHelp if help box needs be refreshed.
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

    /**
     * Get field style string based on current field status.
     * @returns field style
     */
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
                this.currentContact.dataChanged = false;
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
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else{
                let msg = "Failed to restore original value."
                console.error(msg);
            }
        });
    }

    /**
     * Toggle contact detail display.
     * @returns 
     */
    expandContact() {
        this.clickContact = !this.clickContact;
        return this.clickContact;
    }
}
