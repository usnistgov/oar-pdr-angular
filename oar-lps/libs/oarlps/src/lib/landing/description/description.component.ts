import { Component, OnInit, Input, Output, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionPopupComponent } from './description-popup/description-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections } from '../../shared/globals/globals';

@Component({
    selector: 'app-description',
    templateUrl: './description.component.html',
    styleUrls: ['../landing.component.scss', './description.component.css']
})
export class DescriptionComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    @ViewChild('desc') descElement: ElementRef;
    
    fieldName: string = SectionPrefs.getFieldName(Sections.DESCRIPTION);
    editMode: string = MODE.NORNAL; 
    isEditing: boolean = false;
    description: string = "";
    originDescription: string = "";
    originalRecord: any[]; //Original record or the record that's previously saved
    backColor: string = "white";
    resource: string = "resource";
    placeholder: string = "Please add description here.";

    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal,
                public lpService: LandingpageService,                  
                private notificationService: NotificationService){
                    
                this.lpService.watchEditing((sectionMode: SectionMode) => {
                    if( sectionMode ) {
                        if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                            if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                                if(this.isEditing){
                                    this.onSave(false); // Do not refresh help text 
                                }else{
                                    this.setMode(MODE.NORNAL, false);
                                }
                            }
                        }else { // Request from side bar, if not edit mode, start editing
                            if( !this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
                                this.startEditing();
                            }
                        }
                    }
                })
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get descWidth() {
        if(this.isEditing){
            return {'width': 'calc(100% - 70px)', 'height':'fit-content'};
        }else{
            return {'width': 'fit-content', 'max-width': 'calc(100% - 70px)'};
        }
    }
    get dataChanged() {
        if(this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            return this.description != this.record[this.fieldName].join("\r\n\r\n");
        else
            return this.description.trim() != "";
    }

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
        this.getDescription();
    }

    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
            this.getDescription();
        }
    }

    /**
     * Update keywords and original keywords from the record
     */
    getDescription() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.description = this.record[this.fieldName].join("\r\n\r\n");
        else
            this.description = "";

        if(this.originalRecord && this.originalRecord[this.fieldName] && this.originalRecord[this.fieldName].length > 0)
            this.originDescription = this.originalRecord[this.fieldName].join("\r\n\r\n");
        else
            this.originDescription = "";
    }

    /**
     * Set background color based on the status of description
     * if it's the same as original value (nothing changed), set background color to white.
     * Otherwise set it to light yellow.
     * @param keywords 
     */
    setBackground(description: string) {
        if(this.updated){
            this.backColor = 'var(--data-changed-saved)';
        }else if(description != this.originDescription){
            this.backColor = 'var(--data-changed)';
        }else{
            this.backColor = 'white';
        }
    }

    /**
     * Start editing keywords. Set this section in edit mode and broadcast the status so other section will auto save
     * and the help side bar can update the info.
     */
    startEditing() {
        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            const textArea = this.descElement.nativeElement as HTMLTextAreaElement;
            // textArea.focus();
        },0);  

        this.isEditing = true;
        this.setMode(MODE.EDIT);
    }

    /**
     * Cancel current editing. Set this section to normal mode. Restore keywords from previously saved ones.
     */
    cancelEditing() {
        this.getDescription();
        this.setMode(MODE.NORNAL);
        this.setBackground(this.description);
    }

    /**
     * Save keywords.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        if(this.description != this.originDescription) {
            let updmd = {};
            //Split the string into array using double linefeed as delimiter
            updmd[this.fieldName] = this.description.split(/\r?\n\r?\n/gm).filter(desc => desc != '');

            this.record[this.fieldName] = this.description.split(/\r?\n\r?\n/gm).filter(desc => desc != '');

            //Update server
            this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                if (updateSuccess){
                    this.setBackground(this.description);
                    this.notificationService.showSuccessWithTimeout("Keywords updated.", "", 3000);
                }else{
                    let msg = "Description update failued";
                    console.error(msg);
                }
            });
        }

        this.setMode(MODE.NORNAL, refreshHelp);
        this.isEditing = false;
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

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);  
        else
            this.isEditing = false;      
    }

    /**
     * a field indicating whether there are no keywords are set.  
     */
    get isEmpty() {
        if (! this.record[this.fieldName])
            return true;
        if (this.record[this.fieldName] instanceof Array &&
            this.record[this.fieldName].filter(kw => Boolean(kw)).length == 0)
            return true;
        return false;
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode(MODE.NORNAL);
                this.setBackground(this.description);
                this.notificationService.showSuccessWithTimeout("Reverted changes to description.", "", 3000);
            }else{
                let msg = "Failed to undo description metadata";
                console.error(msg);
            }
        });
    }

}
