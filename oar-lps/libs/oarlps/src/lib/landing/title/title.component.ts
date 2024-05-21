import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionPopupComponent } from '../description/description-popup/description-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, SubmitResponse } from '../../shared/globals/globals';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css', '../landing.component.scss'],
    animations: [
        trigger('border', [
            state('hide', style({border: '1px solid rgb(127,127,127, 0)'})),
            state('show', style({border: '1px solid rgb(127,127,127, 1)'})),
            transition('hide <=> show', animate('625ms')),
        ])
    ]
})
export class TitleComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    @ViewChild('title') titleElement: ElementRef;

    fieldName: string = SectionPrefs.getFieldName(Sections.TITLE);
    editMode: string = MODE.NORNAL; 
    isEditing: boolean = false;
    backColor: string = 'white';
    originalRecord: any[];
    borderStatus: string = "show";
    placeholder: string = "Please add a title here.";
    dataChanged: boolean = false;

    constructor(public mdupdsvc: MetadataUpdateService,
        private ngbModal: NgbModal,
        public lpService: LandingpageService, 
        private notificationService: NotificationService) {
            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode ) {
                    if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                        if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                            if(this.isEditing){
                                // Do not refresh hekp content because other section already updated it. 
                                this.onSave(false); 
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
    get titleWidth() {
        if(this.isEditing){
            return {'width': 'calc(100% - 70px)', 'height':'fit-content'};
        }else{
            return {'width': 'fit-content', 'max-width': 'calc(100% - 40px)'};
        }
    }

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
        }
    }

    startEditing(refreshHelp: boolean = true) {
        this.isEditing = true;
        this.setMode(MODE.EDIT, refreshHelp, MODE.EDIT);

        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            if(this.titleElement) {
                const textArea = this.titleElement.nativeElement as HTMLTextAreaElement;
                textArea.focus();
            }
        },0);  
    }

    cancelEditing() {
        //Replace title with saved value
        this.mdupdsvc.loadSavedSubsetFromMemory(this.fieldName).subscribe(title => {
            this.record['title'] = title;
        })

        this.setMode(MODE.NORNAL);
        this.isEditing = false;
        // this.setBackground(this.record['title']);
        this.dataChanged = false;
    }

    onSave(refreshHelp: boolean = true) {
        if(this.record['title'] != this.originalRecord[this.fieldName]) {
            var postMessage: any = {};
                postMessage[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));
            
            this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                if (updateSuccess){
                    this.dataChanged = true;
                    this.notificationService.showSuccessWithTimeout("Title updated.", "", 3000);
                    this.setMode(MODE.NORNAL, refreshHelp);
                    //Validate
                    this.mdupdsvc.validate().subscribe(response => {
                        this.lpService.setSubmitResponse(response as SubmitResponse);
                    })
                }else{
                    let msg = "Title update failed.";
                    console.error(msg);
                }
            });
        }else{
            this.dataChanged = false;
            this.setMode(MODE.NORNAL, refreshHelp);
        }
        // this.setBackground(this.record['title']);
    }
    
    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode(MODE.NORNAL);
                this.notificationService.showSuccessWithTimeout("Reverted changes to title.", "", 3000);
            }else{
                let msg = "Failed to undo title metadata";
                console.error(msg);
            }
        });
        // this.setBackground(this.record['title']);
        this.dataChanged = false;
    }

    /**
     * Set background color based on the status of title
     * if it's the same as original value (nothing changed), set background color to white.
     * Otherwise set it to light yellow.
     * @param title 
     */
    setBackground(title: string) {
        this.dataChanged = title != this.originalRecord['title'];
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
        sectionMode.sender = this.fieldName;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            if(editmode == MODE.NORNAL) help_topic = MODE.NORNAL;

            this.refreshHelpText(help_topic);
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
        else
            this.isEditing = false;
    }

    flash: any;

    flashBorder(stopFlash)
    { 
        if(stopFlash)
        {
            clearInterval(this.flash);
        }
        else
        {
            var borderPattern = false;
            this.flash = setInterval(setBorder,2000);

            function setBorder()
            {
                if(borderPattern)
                {
                    this.borderStatus = "hide";
                    setTimeout(() => {
                        borderPattern = false;
                    }, 0);
                    
                }
                else
                {
                    this.borderStatus = "show";
                    setTimeout(() => {
                        borderPattern = true;
                    }, 0);
                }
            }
        }
    }
}
