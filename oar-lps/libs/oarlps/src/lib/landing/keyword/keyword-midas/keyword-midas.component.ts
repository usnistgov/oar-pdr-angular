import { Component, OnInit, Input, ElementRef, EventEmitter, SimpleChanges, ViewChild, effect, ChangeDetectorRef, inject } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, GlobalService } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { TextEditModule } from '../../../text-edit/text-edit.module';
import { TextareaAutoresizeModule } from '../../../textarea-autoresize/textarea-autoresize.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Chips, ChipsModule } from 'primeng/chips';
import { ChipModule } from "primeng/chip";
import { TagModule } from 'primeng/tag';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { LandingConstants, iconClass } from '../../../shared/globals/globals';
import { KeywordPubComponent } from '../keyword-pub/keyword-pub.component';

@Component({
    selector: 'keyword-midas',
    standalone: true,
    imports: [ 
        CommonModule,
        FormsModule,
        ToolbarModule,
        TextEditModule,
        TextareaAutoresizeModule,
        NgbModule,
        ChipsModule,
        ChipModule,
        TagModule,
        ToastrModule,
        KeywordPubComponent
    ],
    templateUrl: './keyword-midas.component.html',
    styleUrls: ['./keyword-midas.component.scss', '../../landing.component.scss']
})
export class KeywordMidasComponent {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() isEditMode: boolean = true;
    
    fieldName: string = SectionPrefs.getFieldName(Sections.KEYWORDS);
    editMode: string = MODE.NORMAL; 
    placeholder: string = "Enter keywords separated by comma";
    isEditing: boolean = false;
    keywords: string[] = [];
    originKeywords: string = "";
    originalRecord: any[]; //Original record or the record that's previously saved
    message: string = "";
    backColor: string = "white";
    dataChanged: boolean = false;
    keywordShort: string[] = [];
    keywordLong: string[] = [];
    keywordBreakPoint: number = 5;
    keywordDisplay: string[] = [];
    hovered: boolean = false;
    public EDIT_MODES: any = LandingConstants.editModes;
    globalsvc = inject(GlobalService);

    //icon class names
    editIcon = iconClass.EDIT;
    closeIcon = iconClass.CLOSE;
    saveIcon = iconClass.SAVE;
    cancelIcon = iconClass.CANCEL;
    undoIcon = iconClass.UNDO;

    @ViewChild('keyword') public chipsElement: Chips;

    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal, 
                public lpService: LandingpageService,    
                private chref: ChangeDetectorRef,
                private notificationService: NotificationService){ 

    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    get keywordWidth() {
        if(this.isEditing){
            return {'width': 'fit-content', 'max-width': 'calc(100% - 400px)', 'height':'fit-content'};
        }else{
            return {'width': 'fit-content', 'max-width': 'calc(100% - 360px)'};
        }
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

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
        this.getKeywords();
        this.keywordInit();

        this.lpService.watchEditing((sectionMode: SectionMode) => {
            if( sectionMode ) {
                if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                    if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORMAL) {
                        if(this.isEditing){
                            this.onSave(false); // Do not refresh help text 
                        }else{
                            this.setMode(MODE.NORMAL, false);
                        }
                    }
                }else { // Request from side bar, if not edit mode, start editing
                    if( !this.isEditing && sectionMode.section == this.fieldName && this.isEditMode) {
                        this.startEditing();
                    }
                }
            }
        })
    }

    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
            this.getKeywords();
            this.keywordInit();
        }

        this.chref.detectChanges();
    }

    /**
     * Update keywords and original keywords from the record
     */
    getKeywords() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.keywords = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        else
            this.keywords = [];

        if(this.originalRecord && this.originalRecord[this.fieldName] && this.originalRecord[this.fieldName].length > 0)
            this.originKeywords = this.originalRecord[this.fieldName].join(",");
        else
            this.originKeywords = '';
    }

    /**
     * Start editing keywords. Set this section in edit mode and broadcast the status so other section will auto save
     * and the help side bar can update the info.
     */
    startEditing() {
        this.setMode(MODE.EDIT);
        this.isEditing = true;

        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            if(this.chipsElement) {
                this.chipsElement.inputViewChild.nativeElement.focus();
                this.chref.detectChanges();
            }
        },0); 
    }

    /**
     * Cancel current editing. Set this section to normal mode. Restore keywords from previously saved ones.
     */
    cancelEditing() {
        this.getKeywords();
        this.setMode(MODE.NORMAL);
        this.isEditing = false;
        this.setBackground();
    }

    /**
     * Check if current keywords changed
     * @returns true if current keyword changed
     */
    currentKeywordChanged() {
        return this.keywords.filter(x => !this.originalRecord[this.fieldName].includes(x));
    }

    /**
     * Check if any keyword changed (current or previous)
     * @returns true if keyword changed
     */
    keywordChanged() {
        // let keywordChanged = this.record[this.fieldName].filter(x => !this.originalRecord[this.fieldName].includes(x));
        let keywordChanged2 = this.originalRecord[this.fieldName].filter(x => !this.record[this.fieldName].includes(x));

        return (this.currentKeywordChanged() || keywordChanged2.length > 0);
    }

    onAdd(event) {
        this.dataChanged = true;
        this.keywordInit(); 
    }

    onRemove(event) {
        this.dataChanged = true;
        this.keywordInit(); 
    }

    /**
     * Save keywords.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        // Trim items 
        // this.record[this.fieldName] = this.record[this.fieldName].map(element => {
        //     return element.trim();
        // });

        this.keywords = this.keywords.map(element => {
            return element.trim();
        });

        // remove duplicates
        this.keywords = this.keywords.filter((item, index)=> this.keywords.indexOf(item) === index);

        if(this.currentKeywordChanged()) {
            let updmd = {};
            // updmd[this.fieldName] = this.keywords.split(/\s*,\s*/).filter(kw => kw != '');
            // this.record[this.fieldName] = this.keywords.split(/\s*,\s*/).filter(kw => kw != '');

            updmd[this.fieldName] = JSON.parse(JSON.stringify(this.keywords));

            this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                if (updateSuccess){
                    this.notificationService.showSuccessWithTimeout("Keywords updated.", "", 3000);

                    this.setMode(MODE.NORMAL, refreshHelp);
                    this.isEditing = false;
                }else{
                    let msg = "Keywords update failed";
                    console.error(msg);
                    this.setMode(MODE.NORMAL, refreshHelp);
                    this.isEditing = false;
                }
            });
        }else{
            this.setMode(MODE.NORMAL, refreshHelp);
            this.isEditing = false;
        }
    }

    /**
     * Set background color based on the status of keywords
     * if it's the same as original value (nothing changed), set background color to white.
     * Otherwise set it to light yellow.
     * @param keywords 
     */
    setBackground() {
        if(this.keywordChanged()){
            this.backColor = 'var(--data-changed)';
        }else{
            this.backColor = 'white';
        }
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode(MODE.NORMAL);

                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else{
                let msg = "Failed to undo keywords metadata";
                console.error(msg);
            }
        });
        this.setBackground();
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
    setMode(editmode: string = MODE.NORMAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            this.refreshHelpText();
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORMAL){
            this.lpService.setEditing(sectionMode); 
            // this.globalsvc.sectionMode.set(sectionMode);
            this.isEditing = true; 
        }else{
            this.isEditing = false;
            this.dataChanged = false;
        }    

        this.chref.detectChanges();
    }

    /**
     * Set bubble color based on content
     * @param keyword 
     */
    bubbleColor(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            return "#e6ecff";
        }else{
            return "#ededed";
        }
    }

    /**
     * Generate short and long keyword list for display
     */
    keywordInit() {
        if(this.record[this.fieldName]) {
            if(this.record[this.fieldName].length > 5) {
                this.keywordShort = JSON.parse(JSON.stringify(this.record[this.fieldName])).slice(0, this.keywordBreakPoint);
                this.keywordShort.push("Show more...");
                this.keywordLong = JSON.parse(JSON.stringify(this.record[this.fieldName]));
                this.keywordLong.push("Show less...");                
            }else {
                this.keywordShort = JSON.parse(JSON.stringify(this.record[this.fieldName]));
                this.keywordLong = JSON.parse(JSON.stringify(this.record[this.fieldName]));
            }
        }else{
            this.keywordShort = [];
            this.keywordLong = [];
        }

        this.keywordDisplay = this.keywordShort;

        this.chref.detectChanges();
    }

    /**
     * Set border for "More..." and "Less..." button when mouse over
     * @param keyword 
     * @returns 
     */
    borderStyle(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            if(this.hovered){
                return "1px solid blue";
            }else{
                return "1px solid #ededed";
            }
        }else{
            return "1px solid #ededed";
        }
    }

    mouseEnter(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            this.hovered = true;
            this.chref.detectChanges();
        }
    }

    mouseOut(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            this.hovered = false;
            this.chref.detectChanges();
        }
    }

    /**
     * Display short/long list based on which button was clicked.
     * @param keyword 
     */
    keywordClick(keyword) {
        if(keyword == "Show more...") {
            this.keywordDisplay = this.keywordLong;
        }

        if(keyword == "Show less...") {
            this.keywordDisplay = this.keywordShort;
        }

        this.hovered = false;
        this.chref.detectChanges();
    }

    /**
     * Set cursor type for "More..." and "Less..." button
     * @param keyword
     * @returns 
     */
    setCursor(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            return "pointer";
        }else{
            return "";
        }
    }    

}
