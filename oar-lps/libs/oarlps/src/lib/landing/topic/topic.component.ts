import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchTopicsComponent } from './topic-popup/search-topics.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { AppConfig } from '../../config/config';
import { LandingpageService, SectionMode, MODE, SectionHelp, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-topic',
    templateUrl: './topic.component.html',
    styleUrls: ['../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class TopicComponent implements OnInit {
    nistTaxonomyTopics: any[] = [];
    scienceThemeTopics: any[] = [];
    recordType: string = "";
    standardNISTTaxonomyURI: string = "https://data.nist.gov/od/dm/nist-themes/";

    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean;   // false if running server-side
    //05-12-2020 Ray asked to read topic data from 'theme' instead of 'topic'
    fieldName = 'theme';
    editMode: string = MODE.NORNAL; 
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';
    dataChanged: boolean = false;

    constructor(public mdupdsvc: MetadataUpdateService,
                private ngbModal: NgbModal,
                private cfg: AppConfig,
                public lpService: LandingpageService, 
                private notificationService: NotificationService) {

            this.standardNISTTaxonomyURI = this.cfg.get("standardNISTTaxonomyURI", "https://data.nist.gov/od/dm/nist-themes/");

            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                    if(this.isEditing && this.dataChanged){
                        this.onSave(false); // Do not refresh help text 
                    }
                    this.setMode(MODE.NORNAL,false);
                }
            })        
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get isEditing() { return this.editMode==MODE.EDIT }

    get isNormal() { return this.editMode==MODE.NORNAL }
    /**
     * a field indicating whether there is no topic.  
     */
    get isEmpty() {
        if(this.recordType == "Science Theme"){
            return this.scienceThemeTopics.length <= 0 && this.nistTaxonomyTopics.length <= 0;
        }else{
            return this.nistTaxonomyTopics.length <= 0;
        }
    }

    ngOnInit() {
        this.updateResearchTopics();
    }

    /**
     * Once input record changed, refresh the topic list 
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.updateResearchTopics();
    }

    /**
     * Start editing topics. Set this section in edit mode and broadcast the status so other section will auto save
     * and the help side bar can update the info.
     */
    startEditing() {
        this.setMode(MODE.EDIT);
    }

    /**
     * Save topics.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        this.updateResearchTopics();
        this.setMode();
        this.dataChanged = false;
    }

    /**
     * Cancel current editing. Set this section to normal mode. Restore topics from previously saved ones.
     */
    cancelEditing() {
        // this.updateResearchTopics();
        this.setMode(MODE.NORNAL);
        this.dataChanged = false;
        // this.setBackground();
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onDataChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'dataChanged':
                this.record[this.fieldName] = dataChanged[this.fieldName];
                this.dataChanged = true;
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
            case 'saveTopics':
                this.onSave();
                break;
            case 'undoCurrentChanges':
                this.cancelEditing();
                break;
            case 'restoreOriginal':
                this.setMode();
                break;
            default:
                break;
        }
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
                this.editBlockStatus = 'expanded';
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
     * Update the research topic lists
     */
    updateResearchTopics() {
        if(this.record) {
            this.scienceThemeTopics = [];
            this.nistTaxonomyTopics = [];

            if(this.record['topic']) {
                this.record['topic'].forEach(topic => {
                    if(topic['scheme'].indexOf(this.standardNISTTaxonomyURI) < 0){
                        if(this.scienceThemeTopics.indexOf(topic.tag) < 0)
                            this.scienceThemeTopics.push(topic.tag);
                    }
                });
            }

            if(this.record['theme']) {
                this.record['theme'].forEach(topic => {
                    if(this.nistTaxonomyTopics.indexOf(topic) < 0)
                        this.nistTaxonomyTopics.push(topic);
                });
            }
        }
    }

    /**
     * Open topic pop up window
     */
    openModal() {
        // Do nothing if it's not in edit mode. 
        // This should never happen because the edit button should be disabled.
        if (!this.mdupdsvc.isEditMode) return;

        // Pop up dialog set up
        // backdrop: 'static' - the pop up will not be closed 
        //                      when user click outside the dialog window.
        // windowClass: "myCustomModalClass" - pop up dialog styling defined in styles.scss

        // Broadcast the status change
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = MODE.EDIT;
        sectionMode.section = 'topic';
        sectionMode.mode = this.editMode;
        this.lpService.setEditing(sectionMode);

        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "myCustomModalClass"
        };

        const modalRef = this.ngbModal.open(SearchTopicsComponent, ngbModalOptions);

        let val: string[] = [];
        if (this.record[this.fieldName])
            val = JSON.parse(JSON.stringify(this.nistTaxonomyTopics));

        modalRef.componentInstance.inputValue = {};
        modalRef.componentInstance.inputValue[this.fieldName] = val;
        modalRef.componentInstance['field'] = this.fieldName;
        modalRef.componentInstance['title'] = "Research Topics";

        modalRef.componentInstance.returnValue.subscribe((returnValue) => {
            if (returnValue) {
                var postMessage: any = {};
                postMessage[this.fieldName] = returnValue[this.fieldName];
                this.record[this.fieldName] = returnValue[this.fieldName];
                
                this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess) {
                        this.notificationService.showSuccessWithTimeout("Research topics updated.", "", 3000);

                        this.updateResearchTopics();
                    } else
                        console.error("acknowledge topic update failure");
                });
            }
        })
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success) {
                this.notificationService.showSuccessWithTimeout("Reverted changes to research topic.", "", 3000);
                this.setMode(MODE.NORNAL);
                this.updateResearchTopics();
                // this.setBackground();
            } else
                console.error("Failed to undo research topic")
        });
    }

    /**
     * Function to Check record has topics
     */
    checkTopics() {
        if (Array.isArray(this.record[this.fieldName])) {
            if (this.record[this.fieldName].length > 0)
                return true;
            else
                return false;
        }
        else {
            return false;
        }
    }

    /**
     * Determind the edit icon class based on current editing status
     * @returns icon class of the edit button
     */
    editIconClass() {
        if(this.isEditing){
            return "faa faa-pencil icon_disabled";
        }else{
            return "faa faa-pencil icon_enabled"
        }
    }


}
