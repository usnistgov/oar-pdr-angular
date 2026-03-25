import { Component, effect, Input, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { MetadataUpdateService } from './metadataupdate.service';
import { UpdateDetails } from './interfaces';
import { LandingConstants } from '../../shared/globals/globals';
import { EditStatusService } from './editstatus.service';
import { NerdmRes, NerdmComp, NERDResource } from '../../nerdm/nerdm';
import { Sections, SectionPrefs, ResourceType, GlobalService } from '../../shared/globals/globals';
import { LandingpageService } from '../landingpage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../../shared/globals/globals';

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
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule
    ],
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

    //icon class names
    spinnerIcon = iconClass.SPINNER;

    @Input() mdrec: NerdmRes;
    @Input() forceDisplay: boolean = false;  // if true, display the message even if there is no update details. This is used to display a message when the record is in outside-midas mode and there is no update details.

    /**
     * construct the component
     *
     * @param mdupdsvc    the MetadataUpdateService that is receiving updates.  This will be 
     *                    used to be alerted when updates have been made.
     */
    constructor(
        public mdupdsvc : MetadataUpdateService, 
        public edstatsvc: EditStatusService,
        public globalsvc: GlobalService,
        private cdr: ChangeDetectorRef,
        private datePipe: DatePipe,
        public iconLibrary: FaIconLibrary,
        public lpService: LandingpageService) {

        iconLibrary.addIcons(faSpinner);
        
        effect(() => {
            this.message = this.globalsvc.message();
            this.showMessage(this.message);
            this.cdr.detectChanges();
        });

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
        if (this.mdrec) this.setContentStatusColor(this.mdrec);
    }
    
    get action() {
        if (this.mdupdsvc.recStatus.published) {
                return "Published";
        } else if (this.mdupdsvc.recStatus.submitted) {
            return "Submitted";
        } else if (this._updateDetails && this._updateDetails._updateDate) { // _updateDate is either the date of last edit or last save, depending on the status of the record
            return "Saved";
        } else {
            return "";
        }      
    }

    get user() {
        let user = "Unknown user";
        if (this.updateDetails) {
            if(this.updateDetails.userAttributes && this.updateDetails.userAttributes.userName)
                user = this.updateDetails.userAttributes.userName;
            if(this.updateDetails.userAttributes && this.updateDetails.userAttributes.userLastName)
                user = user + " " + this.updateDetails.userAttributes.userLastName;  
        }
        return user;
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
            if (this.updateDetails){
                // Check if this record has been edited or published
               
                let message = "";
                if (this.mdupdsvc.recStatus.published) {
                    // message = "by " + user + " on " + new Date(this.datePipe.transform(new Date(this.mdupdsvc.recStatus.published * 1000), "MMM d, y, h:mm:ss a"));
                    message = "by " + this.user + " on " + new Date(this.mdupdsvc.recStatus.published * 1000).toLocaleString();
                } else if (this.mdupdsvc.recStatus.submitted) {
                    message = "by " + this.user + " on " + new Date(this.mdupdsvc.recStatus.submitted * 1000).toLocaleString();
                } else if (this._updateDetails._updateDate) { // _updateDate is either the date of last edit or last save, depending on the status of the record
                    message = "by " + this.user + " on " + this._updateDetails._updateDate;
                }

                this.showMessage(message);
            }else
                this.showMessage('');
          break;
        case this.EDIT_MODES.PREVIEW_MODE:
              if (this.updateDetails) {
                  if (this.mdupdsvc.recStatus.published) {
                        this.showMessage("There are un-submitted changes last edited on " + this.updateDetails._updateDate + ".  Click on the Revise Record button to continue editing.",
                            false, "rgb(255, 115, 0)");
                    } else if(this.mdupdsvc.recStatus.submitted) {
                        this.showMessage("by " + this.user + " on " + new Date(this.mdupdsvc.recStatus.submitted * 1000).toLocaleString(),
                            false, "rgb(255, 115, 0)");
                    } else {
                        this.showMessage("There are un-submitted changes last edited on " + this.updateDetails._updateDate + ".  Click on the Edit button to continue editing.",
                            false, "rgb(255, 115, 0)");
                    }

              } else{
                this.showMessage('To see any previously edited inputs or to otherwise edit this page, click on the "Edit" button.');
              }
          break;   
        case this.EDIT_MODES.DONE_MODE:
            this.showMessage('');
          break;
      }        
    }
}
