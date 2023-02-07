import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionPopupComponent } from '../description/description-popup/description-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, SectionMode, MODE, SectionHelp, HelpTopic } from '../landingpage.service';

@Component({
    selector: 'app-keyword',
    templateUrl: './keyword.component.html',
    styleUrls: ['../landing.component.scss']
})
export class KeywordComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    fieldName: string = 'keyword';
    editMode: string = MODE.NORNAL; 
    placeholder: string = "Enter keywords separated by comma";
    isEditing: boolean = false;
    keywords: string = "";
    originKeywords: string = "";
    originalRecord: any[];
    message: string = "";
    backColor: string = "white";

    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal, 
                public lpService: LandingpageService,    
                private notificationService: NotificationService){ 
                    this.lpService.watchEditing((sectionMode: SectionMode) => {
                        if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                            if(this.isEditing){
                                this.onSave(false); // Do not refresh help text 
                            }else{
                                this.setMode(MODE.NORNAL, false);
                            }
                        }
                    })
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

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

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
        this.getKeywords();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
            this.getKeywords();
        }
    }

    getKeywords() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.keywords = this.record[this.fieldName].join(",");

        if(this.originalRecord && this.originalRecord[this.fieldName] && this.originalRecord[this.fieldName].length > 0)
            this.originKeywords = this.originalRecord[this.fieldName].join(",");
    }

    startEditing() {
        this.setMode(MODE.EDIT);
        this.isEditing = true;
    }

    cancelEditing() {
        this.getKeywords();
        this.setMode(MODE.NORNAL);
        this.isEditing = false;
        this.setBackground(this.keywords);
    }

    onSave(refreshHelp: boolean = true) {
        // Replace line feeds with comma
        this.keywords = this.keywords.replace(new RegExp("[\r\n]", "gm"), ",");

        // Replace semicolon with comma
        this.keywords = this.keywords.replace(new RegExp("[\;]", "gm"), ",");

        if(this.keywords != this.originKeywords) {

            let updmd = {};
            updmd[this.fieldName] = this.keywords.split(/\s*,\s*/).filter(kw => kw != '');
            this.record[this.fieldName] = this.keywords.split(/\s*,\s*/).filter(kw => kw != '');

            this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                if (updateSuccess)
                    this.notificationService.showSuccessWithTimeout("Keywords updated.", "", 3000);
                else
                    console.error("acknowledge keywords update failure");
            });
        }

        this.setMode(MODE.NORNAL, refreshHelp);
        this.isEditing = false;
    }

    onKeywordChange(event: any) {
        this.keywords = event;
    }

    /**
     * Set background color based on the status of keywords
     * if it's the same as original value (nothing changed), set background color to white.
     * Otherwise set it to light yellow.
     * @param keywords 
     */
    setBackground(keywords: string) {
        if(keywords != this.originKeywords){
            this.backColor = 'var(--data-changed)';
        }else{
            this.backColor = 'white';
        }
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.setMode(MODE.NORNAL);
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success)
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            else
                console.error("Failed to undo keywords metadata")
        });
        this.setBackground(this.keywords);
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

        //Broadcast the current section and mode
        this.lpService.setEditing(sectionMode);        
    }
}
