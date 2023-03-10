import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, SectionMode, MODE, SectionHelp, HelpTopic } from '../landingpage.service';
import { Reference } from './reference';


@Component({
    selector: 'app-references',
    templateUrl: './references.component.html',
    styleUrls: ['../landing.component.scss', './references.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class ReferencesComponent implements OnInit {
    fieldName: string = 'references';
    editBlockStatus: string = 'collapsed';
    editMode: string = MODE.NORNAL; 
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose
    overflowStyle: string = 'hidden';
    dataChanged: boolean = false;
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    constructor(public mdupdsvc : MetadataUpdateService,        
        private ngbModal: NgbModal,                
        private notificationService: NotificationService,
        public lpService: LandingpageService) { 

            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                    if(this.editBlockStatus == 'expanded')
                    this.setMode(MODE.NORNAL, false);
                }
            })
    }

    ngOnInit(): void {
        this.resetOrigin();
    }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record){
            this.resetOrigin();
        }
            
    }

    resetOrigin() {
        if(this.record && this.record['references'] && this.record['references'].length > 0) {
            // this.currentRef = this.record['references'][0];

            //Keep a copy of the record for undo purpose
            this.orig_record = JSON.parse(JSON.stringify(this.record));
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
            default:
                break;
        }
    }

    get isNormal() { return this.editMode==MODE.NORNAL }
    get isEditing() { return this.editMode==MODE.EDIT }

    /**
     * set current mode to editing.
     */
    onEdit() {
        this.setMode(MODE.EDIT);
    }

    /**
     * Determine icon class of edit button
     * If edit mode is normal, display edit icon.
     * Otherwise display check icon.
     * @returns edit button icon class
     */   
    editIconClass() {
        if(!this.isEditing){
            return "faa faa-pencil icon_enabled";
        }else{
            return "faa faa-pencil icon_disabled";
        }
    }

    /**
     * Get the section style based on different modes
     * @returns div style
     */
    getStyle(){
        if(this.mdupdsvc.isEditMode){
            return this.mdupdsvc.getFieldStyle(this.fieldName, this.dataChanged);
        }else{
            return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
        }
    }

    /**
     * Expand the edit block that user can edit reference data
     */
    openEditBlock() {
        this.editBlockStatus = 'expanded';

        //Broadcast current edit section so landing page will scroll to the section
        this.lpService.setCurrentSection('references');
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

        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];

        if(refreshHelp){
            this.lpService.setSectionHelp(sectionHelp);
        }
            

        switch ( this.editMode ) {
            case MODE.EDIT:
                this.openEditBlock();
                this.setOverflowStyle();
                break;

            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.setOverflowStyle();
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
     * Function to Check whether given record has references that need to be displayed
     */
    hasDisplayableReferences() {
        if (this.record && this.record['references'] && this.record['references'].length > 0) 
            return true;
        return false;
    }

}
