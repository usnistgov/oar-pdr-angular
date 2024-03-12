import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { Themes, ThemesPrefs, AppSettings } from '../../shared/globals/globals';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';
import { VisithomeEditComponent } from './visithome-edit/visithome-edit.component';

@Component({
    selector: 'app-visithome',
    templateUrl: './visithome.component.html',
    styleUrls: ['./visithome.component.css', '../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class VisithomeComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;
    @Input() theme: string;

    fieldName = SectionPrefs.getFieldName(Sections.VISIT_HOME_PAGE);
    scienceTheme = Themes.SCIENCE_THEME;
    // backgroundColor: string = 'var(--editable)'; // Background color of the text edit area
    editMode: string = MODE.NORNAL; 
    visitHomeURL: string = "";
    dataChanged: boolean = false;
    originalRecord: any = {};
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';

    @ViewChild('visithomeedit') visitHomeEdit: VisithomeEditComponent;
    
    constructor(
        public mdupdsvc : MetadataUpdateService,        
        public lpService: LandingpageService, 
        private notificationService: NotificationService,
        private gaService: GoogleAnalyticsService) { 

            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if(sectionMode){
                    if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                        if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                            if(this.isEditing && this.dataChanged){
                                this.saveVisitHomeURL(false); // Do not refresh help text 
                            }
                            this.setMode(MODE.NORNAL,false);
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
        this.visitHomeURL = "";

        if(this.hasVisitHomeURL) {
            this.visitHomeURL = JSON.parse(JSON.stringify(this.record[this.fieldName]));
            this.dataChanged = false;

            this.originalRecord[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        }
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    get isEditing() { return this.editMode==MODE.EDIT }

    get isNormal() { return this.editMode==MODE.NORNAL }

    get hasVisitHomeURL() {
        if(!this.record) return false;
        else return this.isExternalHomePage(this.record[this.fieldName]);
    }

    /**
     * return true if the given URL does not appear to be a PDR-generated home page URL.
     * Note that if the input URL is not a string, false is returned.  
     */
    public isExternalHomePage(url : string) : boolean {
        if (! url)
            return false;
        let pdrhomeurl = /^https?:\/\/(\w+)(\.\w+)*\/od\/id\//
        return ((url.match(pdrhomeurl)) ? false : true);
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
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onDataChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'dataChanged':
                this.record[this.fieldName] = dataChanged.visitHomeURL;
                this.visitHomeURL = dataChanged.visitHomeURL;
                this.dataChanged = true;
                break;

            case 'dataReset':
                this.record[this.fieldName] = dataChanged.visitHomeURL;
                this.visitHomeURL = dataChanged.visitHomeURL;
                this.dataChanged = false;
                this.visitHomeEdit.currentValueChanged = false;
                break;

            default:
                break;
        }
    }

    /**
     * Handle commands from child component
     * @param cmd command from child component
     */
    onCommandChanged(cmd) {
        switch(cmd.command) {
            case 'saveURL':
                this.saveVisitHomeURL();
                break;
            case 'undoCurrentChanges':
                this.undoCurrentChanges();
                break;
            case 'restoreOriginal':
                this.restoreOriginal();
                break;
            default:
                this.setMode();
                break;
        }
    }

    startEditing() {
        this.visitHomeURL = this.record[this.fieldName];

        this.setMode(MODE.EDIT);
    }

    /**
     * Unde current changes on Visit Home URL
     */
    undoCurrentChanges() {
        if(this.originalRecord[this.fieldName] == undefined) {
            this.record[this.fieldName] = undefined;
            this.visitHomeURL = "";
        }else{
            this.record[this.fieldName] = JSON.parse(JSON.stringify(this.originalRecord[this.fieldName]));
            this.visitHomeURL = this.record[this.fieldName];
        }

        this.dataChanged = false;
    }

    saveVisitHomeURL(refreshHelp: boolean = true) {
        if(!this.visitHomeURL) {
            this.visitHomeURL = "";
        }
        console.log('this.visitHomeURL', this.visitHomeURL);

        this.record[this.fieldName] = this.visitHomeURL;
        let postMessage: any = {};
        postMessage[this.fieldName] = this.visitHomeURL;;

        this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
            if (updateSuccess){
                this.setMode(MODE.NORNAL, refreshHelp);

                this.notificationService.showSuccessWithTimeout(this.fieldName + " updated.", "", 3000);
            }else{
                let msg = "Updating " + this.fieldName + " failed.";
                console.error(msg);
            }
        });        
    }

    /**
     * Retuen background color of the whole record (the container of all authors) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    get backgroundColor() {
        let bkgroundColor = 'var(--editable)';

        if(this.updated){
            bkgroundColor = 'var(--data-changed-saved)';
        }
        
        if(this.dataChanged){
            bkgroundColor = 'var(--data-changed)';
        }

        return bkgroundColor;
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
                this.editBlockStatus = 'collapsed';
                this.dataChanged = false;
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

    /*
     *  Restore original value. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode();
                this.visitHomeEdit.currentValueChanged = false;
                this.notificationService.showSuccessWithTimeout("Reverted changes to landingpage.", "", 3000);
            }else{
                let msg = "Failed to undo landingpage metadata";
                console.error(msg);
            }
        });
    }

    /**
     * Return visit homepage button style
     * @returns 
     */
    visitHomePageBtnStyle() {
        if(this.theme == this.scienceTheme) {
            return "var(--science-theme-background-default)";
        }else{
            return "var(--nist-green-default)";
        }
    }

    /**
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    googleAnalytics(url: string, event, title) {
        this.gaService.gaTrackEvent('homepage', event, title, url);
    }
}
