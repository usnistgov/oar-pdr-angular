import { Component, OnInit, SimpleChanges, Input, ViewChild, ElementRef, ChangeDetectorRef, ApplicationRef, inject, effect } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../../nerdm/nerdm';
import { Themes, ThemesPrefs } from '../../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { DomSanitizer } from "@angular/platform-browser";
import { AccesspageListComponent } from '../accesspage-list/accesspage-list.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from '../../collapseDirective/collapse.module';
import { AccesspagePubComponent } from '../accesspage-pub/accesspage-pub.component';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'accesspage-midas',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule,
        CollapseModule,
        AccesspageListComponent,
        AccesspagePubComponent,
        TooltipModule
    ],
    providers: [
        MetadataUpdateService
    ],
    templateUrl: './accesspage-midas.component.html',
    styleUrls: ['./accesspage-midas.component.scss', '../../landing.component.scss'],
    animations: [
        trigger('enterAnimation', [
        state('enter', style({height: '0px', opacity: 0})),
        state('leave', style({height: '*', opacity: 1})),
        transition('enter <=> leave', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('editExpanded', [
            state('false', style({height: '0px', minHeight: '0'})),
            state('true', style({height: '*'})),
            transition('true <=> false', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class AccesspageMidasComponent {
    accessPages: NerdmComp[] = [];
    editBlockExpanded: boolean = false;
    fieldName: string = SectionPrefs.getFieldName(Sections.ACCESS_PAGES);
    editMode: string = MODE.NORMAL; 
    orig_record: any[]; //Original record or the record that's previously saved
    overflowStyle: string = 'hidden';
    dataChanged: boolean = false;
    currentApageIndex: number = -1;
    currentApage: NerdmComp = {} as NerdmComp;
    orig_aPages: NerdmComp[] = null; // Keep a copy of original access pages for undo purpose
    nonAccessPages: NerdmComp[] = []; // Keep a copy of original record for update purpose
    scienceTheme = Themes.SCIENCE_THEME;
    isPublicSite: boolean = false; 
    loadListing: boolean = false;
    globalsvc = inject(GlobalService);

    @Input() record: NerdmRes = null;
    @Input() theme: string;
    @Input() isEditMode: boolean = true;

    @ViewChild('accesspagelist') accesspagelist: AccesspageListComponent;

    constructor(public mdupdsvc : MetadataUpdateService,
                private notificationService: NotificationService,
                public lpService: LandingpageService,
                private chref: ChangeDetectorRef,
                private appRef: ApplicationRef,
                private gaService: GoogleAnalyticsService,
                private sanitizer: DomSanitizer) { 

    }

    ngOnInit(): void {
        this.isPublicSite = this.globalsvc.isPublicSite();

        if (this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0){
            this.useMetadata();
        }

        // effect(()=>{
        //     let sectionMode = this.globalsvc.sectionMode()
        this.lpService.watchEditing((sectionMode: SectionMode) => {   
            if(sectionMode){
                if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                    if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORMAL) {
                        if(this.editBlockExpanded){
                            this.accesspagelist.onSectionModeChange(sectionMode);
                            this.setMode(MODE.NORMAL, false);
                        }
                    }
                }else{
                    if(!this.isEditing && sectionMode.section == this.fieldName && this.isEditMode) {
                        this.startEditing();
                    }
                }
            }
        })
    }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record){
            this.useMetadata();  // initialize internal component data based on metadata
        }
         
        this.chref.detectChanges();
    }

    get isNormal() { return this.editMode==MODE.NORMAL }
    get isListing() { return this.editMode==MODE.LIST }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isAdding() { return this.editMode==MODE.ADD }

    /**
     * Return true if any access page was updated.
     */
    get updated() {
        return this.mdupdsvc.anyFieldUpdated(this.fieldName);
    }

    /**
     * select the AccessPage components to display, adding special disply options
     */
    selectAccessPages() : NerdmComp[] {
        let use: NerdmComp[] = (new NERDResource(this.record)).selectAccessPages();
        use = (JSON.parse(JSON.stringify(use))) as NerdmComp[];
        if(use) {
            return use.map((cmp) => {
                if (! cmp['title']) cmp['title'] = cmp['accessURL'];
    
                cmp['showDesc'] = false;
                cmp['backcolor'] = this.getStyle()['background-color'];
                return cmp;
            });
        }else{
            return [] as NerdmComp[];
        }
    }

    useMetadata() {
        //Keep a copy of the record for update purpose
        this.orig_record = JSON.parse(JSON.stringify(this.record));

        this.accessPages = [] as NerdmComp[];
        if (this.record[this.fieldName]) {
            this.accessPages = this.selectAccessPages();
            // if current page has not been set, set it
            if(this.currentApageIndex == -1){
                this.currentApage = this.accessPages[0];
                
                if(this.currentApage)
                    this.currentApage.dataChanged = false;

                this.currentApageIndex = 0;
            }

            //Keep a copy of the record for update purpose
            this.orig_aPages = JSON.parse(JSON.stringify(this.accessPages));

            //Keep a copy of the none access pages for update purpose
            let nonAPages = this.orig_record[this.fieldName].filter(cmp => {
                return !this.accessPages.find(ap => {
                    return ap['@id'] === cmp['@id'];
                });
            });
            this.nonAccessPages = JSON.parse(JSON.stringify(nonAPages));

            // If this is a science theme and the collection contains one or more components that contain both AccessPage (or SearchPage) and DynamicSourceSet, we want to remove it from accessPages array since it's already displayed in the search result.
            if(this.theme == this.scienceTheme) 
                this.accessPages = this.accessPages.filter(cmp => ! cmp['@type'].includes("nrda:DynamicResourceSet"));
        }
    }
    
    /**
     * Get the section style based on different modes
     * @returns div style
     */
    getStyle(){
        if(this.isEditMode){
            let bkcolor = this.mdupdsvc.getFieldStyle(this.fieldName, this.dataChanged, undefined, this.isEditing)

            return bkcolor;
        }else{
            return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
        }
    }

    startEditing() {
        this.loadListing = true;
        this.setMode(MODE.LIST)
    }

    /**
     * Determine icon class of edit button
     * If edit mode is normal, display edit icon.
     * Otherwise display check icon.
     * @returns edit button icon class
     */   
    editIconClass() {
        if(!this.isEditing){
            return "fas fa-pencil icon_enabled";
        }else{
            return "fas fa-pencil icon_disabled";
        }
    }

    /**
     * Open list block for editing
     */
    openListBlock() {
        this.editBlockExpanded = true;
        this.lpService.setCurrentSection("dataAccess");
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
    setMode(editmode: string = MODE.NORMAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;
        switch ( this.editMode ) {
            case MODE.LIST:
                this.openListBlock();
                this.setOverflowStyle();
                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.LIST);
                }
                break;

            case MODE.ADD:

                break;

            case MODE.EDIT:

                break;

            default: // normal
                // Collapse the edit block
                this.editBlockExpanded = false;
                this.setOverflowStyle();

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.NORMAL);
                }
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORMAL)
            // this.globalsvc.sectionMode.set(sectionMode);
            this.lpService.setEditing(sectionMode);

        setTimeout(() => {
            this.chref.detectChanges();
        }, 0);
        
    }

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */
    setOverflowStyle() {
        if(!this.editBlockExpanded) {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }

    /**
     * Handle requests from child component
     * @param status parameter passed from child component
     */
    onStatusChange(status: string) {
        this.setMode(status);
        // switch(status) {
        //     case 'listing':
        //         this.setMode(MODE.LIST);
        //         break;
        //     case 'adding':
        //         this.setMode(MODE.ADD);
        //         break;
        //     case 'editing':
        //         this.setMode(MODE.EDIT);
        //         break;
        //     default: //normal
        //         this.setMode(MODE.NORMAL);
        //         break;
        // }
    }

    // restoreOriginal() {
    //     this.accesspagelist.restoreOriginal();
    // }

    restoreOriginal() {
        this.editBlockExpanded = false;
        this.undoAllApageChanges();
    }

   /**
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
   undoAllApageChanges() {
        // this.record = JSON.parse(JSON.stringify(this.orig_record));
        // this.useMetadata();

        if(this.updated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    this.useMetadata();
                    // this.accessPages.forEach((apage) => {
                    //     apage.dataChanged = false;
                    // });

                    this.setMode(MODE.NORMAL);
                    this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
                }else{
                    let msg = "Failed to undo " + this.fieldName + " metadata";
                    console.error(msg);
                    return;
                }
            });
        }
    }    
}
