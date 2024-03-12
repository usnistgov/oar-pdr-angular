import { Component, OnInit, Input, ElementRef, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { AuthorService } from './author.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Author } from './author';
import * as globals from '../../shared/globals/globals';
import { AuthorListComponent } from './author-list/author-list.component';

@Component({
    selector: 'app-author',
    templateUrl: './author.component.html',
    styleUrls: ['../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class AuthorComponent implements OnInit {
    fieldName = SectionPrefs.getFieldName(Sections.AUTHORS);
    editMode: string = MODE.NORNAL; 
    childEditMode: string = MODE.NORNAL;
    originAuthors: any[] = [];
    originalRecord: any[]; //Original record or the record that's previously saved
    authors: Author[] = [];
    editBlockStatus: string = 'collapsed';
    isEditing: boolean = false;
    overflowStyle: string = 'hidden';
    orderChanged: boolean = false;

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side


    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal,
                public lpService: LandingpageService, 
                private notificationService: NotificationService,
                private authorService: AuthorService) { 

        this.lpService.watchEditing((sectionMode: SectionMode) => {
            if( sectionMode ) {
                if(sectionMode.sender == globals.SectionPrefs.getFieldName(globals.Sections.SIDEBAR)) {
                     // Request from side bar, if not edit mode, start editing
                    if( !this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
                        this.startEditing();
                    }
                }
            }

        })
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.anyFieldUpdated(this.fieldName); }
    get childIsEditing() { return this.childEditMode==MODE.EDIT }
    get childIsAdding() { return this.childEditMode==MODE.ADD }

    @ViewChild('authorlist') authorList: AuthorListComponent;

    /**
     * Check if any author data changed or author order changed
     */
    get authorsChanged() {
        let changed: boolean = false;

        if(this.record[this.fieldName]) {
            this.record[this.fieldName].forEach(author => {
                changed = changed || author.dataChanged;
            })
        }
        
        return changed || this.orderChanged;
    }

    get authorsUpdated() {
        return this.mdupdsvc.anyFieldUpdated(this.fieldName);
    }

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
        this.getAuthors();
    }
    
    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
            this.getAuthors();
        }
    }

    /**
     * Update authors and original authors from the record
     */
    getAuthors() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.authors = JSON.parse(JSON.stringify(this.record[this.fieldName]));

        if(this.originalRecord && this.originalRecord[this.fieldName] && this.originalRecord[this.fieldName].length > 0)
            this.originAuthors = JSON.parse(JSON.stringify(this.originalRecord[this.fieldName]));
    }

    startEditing(refreshHelp: boolean = true) {
        this.setMode(MODE.LIST, refreshHelp, MODE.LIST);
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
     * Refresh the help text
     */
    refreshHelpText(help_topic: string = MODE.EDIT){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[help_topic];

        this.lpService.setSectionHelp(sectionHelp);
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true, help_topic: string = MODE.EDIT) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            if(editmode == MODE.NORNAL) help_topic = MODE.NORNAL;
            this.refreshHelpText(help_topic);
        }
            
        switch ( this.editMode ) {
            case MODE.LIST:
                this.editBlockStatus = "expanded";
                this.setOverflowStyle();
                this.isEditing = true;
                break;

            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.setOverflowStyle();
                this.isEditing = false;
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode();
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else
                console.error("Failed to undo keywords metadata");
        });
    }

    /**
     * Expand author details for non-edit mode
     */
    clicked = false;
    expandClick() {
        this.clicked = !this.clicked;
        return this.clicked;
    }

    getSubunites(subunites)
    {
        if(subunites instanceof Array)
        {
            return subunites.join(', ');
        }else{
            return subunites;
        }
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onAuthorChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'hideEditBlock':
                this.hideEditBlock();
                break;
            case 'dataChanged':

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
        this.isEditing = false;
        this.overflowStyle = 'hidden';
        this.editBlockStatus = 'collapsed';
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
        this.authorList.undoAllChanges();
        this.setMode(MODE.NORNAL, true);
        this.orderChanged = false;
    }    
}
