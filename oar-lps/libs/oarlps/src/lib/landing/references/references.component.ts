import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections } from '../../shared/globals/globals';
import { Reference } from './reference';
import { RefListComponent } from './ref-list/ref-list.component';

@Component({
    selector: 'app-references',
    templateUrl: './references.component.html',
    styleUrls: ['../landing.component.scss', './references.component.css'],
    animations: [
        trigger('editExpand', [
        state('false', style({height: '0px', minHeight: '0'})),
        state('true', style({height: '*'})),
        transition('true <=> false', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class ReferencesComponent implements OnInit {
    fieldName: string = 'references';
    editBlockExpanded: boolean = false;
    editMode: string = MODE.NORNAL; 
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose
    overflowStyle: string = 'hidden';
    dataChanged: boolean = false;
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;
    childEditMode: string = MODE.NORNAL;
    orderChanged: boolean = false;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    constructor(public mdupdsvc : MetadataUpdateService,        
        private ngbModal: NgbModal,                
        private notificationService: NotificationService,
        public lpService: LandingpageService) { 

            this.lpService.watchEditing((sectionMode: SectionMode) => {


                if(sectionMode){
                    if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                        if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                            if(this.editBlockExpanded == true)
                            this.setMode(MODE.NORNAL, false);
                        }
                    }else{
                        if(!this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
                            this.startEditing();
                        }
                    }
                }
            })
    }

    ngOnInit(): void {
        this.resetOrigin();
    }

    ngOnChanges(ch : SimpleChanges) {
        console.log("changes", ch)
        if (ch.record){
            this.resetOrigin();
        }
            
    }

    resetOrigin() {
        // if(this.record && this.record['references'] && this.record['references'].length > 0) {
        console.log("references - this.record", this.record)
        if(this.record){
            // this.currentRef = this.record['references'][0];

            //Keep a copy of the record for undo purpose
            this.orig_record = JSON.parse(JSON.stringify(this.record));
        }else{
            this.orig_record = undefined;
        }
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onRefChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'hideEditBlock':
                this.setMode(MODE.NORNAL);
                break;
            case 'dataChanged':
                this.dataChanged = true;
                break;
            case 'orderChanged':
                this.orderChanged = true;
                break;
            case 'orderReset':
                this.orderChanged = false;
                break;                
            default:
                break;
        }
    }

    /**
     * Hide edit block
     */
    hideEditBlock() {
        this.setMode(MODE.NORNAL);
    }

    get isNormal() { return this.editMode==MODE.NORNAL }
    get isListing() { return this.editMode==MODE.LIST }
    get isEditing() { return this.editMode==MODE.EDIT }
    get childIsEditing() { return this.childEditMode==MODE.EDIT }
    get childIsAdding() { return this.childEditMode==MODE.ADD }
    
    @ViewChild('reflist') refList: RefListComponent;

    /**
     * Check if any author data changed or author order changed
     */
    get refChanged() {
        let changed: boolean = false;

        if(this.record[this.fieldName]) {
            this.record[this.fieldName].forEach(author => {
                changed = changed || author.dataChanged;
            })
        }
        
        return changed || this.orderChanged;
    }

    get refUpdated() {
        return this.mdupdsvc.anyFieldUpdated(this.fieldName);
    }

    /**
     * set current mode to editing.
     */
    startEditing(refreshHelp: boolean = true) {
        this.setMode(MODE.LIST, refreshHelp);
    }

    /**
     * Determine icon class of edit button
     * If edit mode is normal, display edit icon.
     * Otherwise display check icon.
     * @returns edit button icon class
     */   
    editIconClass() {
        if(!this.isEditing){
            return "fas fa-pencil icon_enabled";
        }else{
            return "fas fa-pencil icon_disabled";
        }
    }

    /**
     * Get the section style based on different modes
     * @returns div style
     */
    getStyle(){
        if(this.mdupdsvc.isEditMode){
            return this.mdupdsvc.getFieldStyle(this.fieldName, this.dataChanged, undefined, this.isEditing);
        }else{
            return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
        }
    }

    /**
     * Expand the edit block that user can edit reference data
     */
    openEditBlock() {
        this.editBlockExpanded = true;

        //Broadcast current edit section so landing page will scroll to the section
        this.lpService.setCurrentSection('references');
    }

    /**
     * Refresh the help text
     */
    refreshHelpText(help_topic: string = MODE.LIST){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[help_topic];

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
            
        switch ( this.editMode ) {
            case MODE.LIST:
                this.openEditBlock();
                this.setOverflowStyle();

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.LIST);
                }
                break;

            default: // normal
                // Collapse the edit block
                this.editBlockExpanded = false;
                this.setOverflowStyle();

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.NORNAL);
                }                
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */
    setOverflowStyle() {
        if(!this.editBlockExpanded) {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }

    /**
     * Function to Check whether given record has references that need to be displayed
     */
    hasDisplayableReferences() {
        if (this.record && this.record['references'] && this.record['references'].length > 0) 
            return true;
        return false;
    }

    /**
     * Update the edit status of child component 
     * so we can set the status of the close button
     * @param editmode editmode from child component
     */
    setChildEditMode(editmode: string) {
        this.childEditMode = editmode;
    }    

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoAllChanges() {
        this.refList.undoAllChangesConfirmation();
        this.orderChanged = false; 
        this.hideEditBlock();
    }   
}
