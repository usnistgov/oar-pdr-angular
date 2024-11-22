import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

import { MetadataUpdateService } from './metadataupdate.service';
import { UpdateDetails } from './interfaces';
import { LandingConstants } from '../constants';
import { EditStatusService } from './editstatus.service';
import { NerdmRes, NerdmComp, NERDResource } from '../../nerdm/nerdm';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, ResourceType } from '../../shared/globals/globals';
import { LandingpageService } from '../landingpage.service';

/**
 * A panel inside the EditControlComponent that displays information about the status of 
 * editing.
 *
 * Features:
 *  * If we know the date of the last update, it displays it
 *  * If we don't know the date, it recommends clicking the Edit button to see latest
 *    updates. 
 *  * During interactions with the customization web service, a spinner is displayed.
 */
@Component({
    selector: 'pdr-edit-status',
    templateUrl: 'editstatus.component.html',
    styleUrls: ['editstatus.component.css']
})
export class EditStatusComponent implements OnInit {

    private _updateDetails : UpdateDetails = null;
    get updateDetails() { return this._updateDetails; }
    
    message : string = "";
    messageColor : string = "black";
    EDIT_MODES: any;
    _editmode: string;
    contentStatusColer: string = "var(--nist-green-default);"
    resourceType: string = "resource";

    @Input() mdrec: NerdmRes;

    /**
     * construct the component
     *
     * @param mdupdsvc    the MetadataUpdateService that is receiving updates.  This will be 
     *                    used to be alerted when updates have been made.
     */
    constructor(
        public mdupdsvc : MetadataUpdateService, 
        public edstatsvc: EditStatusService,
        public lpService: LandingpageService) {

        this.EDIT_MODES = LandingConstants.editModes;
        this.mdupdsvc.updated.subscribe((details) => { 
            this._updateDetails = details; 
            this.showLastUpdate();  //Once last updated date changed, refresh the status bar message
        });

        this.edstatsvc.watchEditMode((editMode) => {
          this._editmode = editMode;
          this.showLastUpdate();
          if(this._editmode == this.EDIT_MODES.OUTSIDE_MIDAS_MODE)
            this.showMessage("", false);
        });

        this.lpService.watchResourceType((resourceType: string) => {
            this.resourceType = resourceType;

            if(this.mdrec)
                this.setContentStatusColor(this.mdrec);
        })
    }

    /**
     * a flag for controlling the appearance of the spinner
     */
    private _isProcessing : boolean = false;
    get isProcessing() { return this._isProcessing; }

    /**
     * set the date of the last update.
     */
    public setLastUpdateDetails(updateDetails : UpdateDetails) {
        this._updateDetails = updateDetails;
    }

    /**
     * indicate whether the we are currently processing an edit
     */
    public setIsProcessing(onoff : boolean) {
        this._isProcessing = onoff;
    }

    ngOnInit() {
        if(this.mdrec)
            this.setContentStatusColor(this.mdrec);
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if(this.mdrec) this.setContentStatusColor(this.mdrec);
    }
    
    public setContentStatusColor(record: NerdmRes) {
        let required: boolean = false;
        let recommended: boolean = false;
        let niceToHave: boolean = false;
        
            // Required fields
            if(!record[SectionPrefs.getFieldName(Sections.TITLE)]) 
                required = true;
    
            if(!record[SectionPrefs.getFieldName(Sections.DESCRIPTION)] || record[SectionPrefs.getFieldName(Sections.DESCRIPTION)].length == 0) 
                required = true;
    
            if(!record[SectionPrefs.getFieldName(Sections.TOPICS)] || record[SectionPrefs.getFieldName(Sections.TOPICS)].length == 0) 
                required = true;
    
            if(!record[SectionPrefs.getFieldName(Sections.KEYWORDS)] || record[SectionPrefs.getFieldName(Sections.KEYWORDS)].length == 0) 
                required = true;
    
            // Recommended fields
            if(!record[SectionPrefs.getFieldName(Sections.AUTHORS)] || record[SectionPrefs.getFieldName(Sections.AUTHORS)].length == 0) 
                recommended = true;
    
            if(!record[SectionPrefs.getFieldName(Sections.CONTACT)]) 
                recommended = true;
    
            if(!record[SectionPrefs.getFieldName(Sections.VISIT_HOME_PAGE)]) 
                recommended = true;
    
            let accessPages: NerdmComp[] = (new NERDResource(record)).selectAccessPages();
    
            // If resource type is "software", access page links are recommended. Otherwise they are nice to have.
            if(!accessPages || accessPages.length == 0) {
                if(this.resourceType == ResourceType.SOFTWARE) {
                    recommended = true;
                }else{
                    niceToHave = true;
                }
            }
    
            // Nice to have fields
            if(!record[SectionPrefs.getFieldName(Sections.REFERENCES)] || record[SectionPrefs.getFieldName(Sections.REFERENCES)].length == 0) 
                niceToHave = true;
    

            // Set color
            if(required){
                this.contentStatusColer = "var(--warning)";
            }else if(recommended) {
                this.contentStatusColer = "var(--alert)";
            }else if(niceToHave) {
                this.contentStatusColer = "var(--nist-green-lighter)";
            }else{
                this.contentStatusColer = "var(--nist-green-default)";
            }
    }
    /**
     * Display an arbitrary message
     */
    public showMessage(msg : string, inprogress : boolean = false, color : string = "black") {
        this.message = msg;
        this.messageColor = color;
        this._isProcessing = inprogress;
    }

    /**
     * display the time of the last update, if known
     */
    public showLastUpdate() {
      switch(this._editmode){
        case this.EDIT_MODES.EDIT_MODE:
            // We are editing the metadata (and are logged in)
            if (this.updateDetails)
                this.showMessage("Edited by " + this.updateDetails.userAttributes.userName + " " + this.updateDetails.userAttributes.userLastName + " on " + this.updateDetails._updateDate);
            else
                this.showMessage('');
          break;
        case this.EDIT_MODES.PREVIEW_MODE:
            if (this.updateDetails)
                this.showMessage("There are un-submitted changes last edited on " + this.updateDetails._updateDate + ".  Click on the Edit button to continue editing.", 
                false, "rgb(255, 115, 0)");
            else
                this.showMessage('To see any previously edited inputs or to otherwise edit this page, click on the "Edit" button.');
          break;   
        case this.EDIT_MODES.DONE_MODE:
            this.showMessage('');
          break;
      }        
    }
}
