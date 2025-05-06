import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { NerdmRes, NERDResource } from '../nerdm/nerdm';
import { LandingpageService } from '../landing/landingpage.service';
import { SidebarService } from './sidebar.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, GENERAL, ReviewResponse } from '../shared/globals/globals';
import { HelpTopic } from '../landing/landingpage.service';
import { CommonModule } from '@angular/common';
import { DAPService } from '../nerdm/dap.service';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { MetadataUpdateService } from '../landing/editcontrol/metadataupdate.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        SuggestionsComponent
    ],
    providers: [
        SidebarService
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    animations: [
        trigger("togglesbar", [
            state('sbvisible', style({
                position: 'absolute',
                right: '0%',
                top: "20px",
                bottom: "100%",
                overflow: "auto"
            })),
            state('sbhidden', style({
                position: 'absolute',
                right: '-450%',
                top: "20px",
                bottom: "100%",
                overflow: "hidden"
            })),
            transition('sbvisible <=> sbhidden', [
                animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            ])
        ]),
        trigger('requiredExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('warnExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('recommendedExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]
})
export class SidebarComponent implements OnInit {
    sbarvisible : boolean = true;
    sidebarState: string = 'sbvisible';
    helpContent: string = "";
    suggestions: ReviewResponse = {} as ReviewResponse;
    fieldName: string = "sidebar";
    DEFAULT_TITLE: string = "General Help";
    title: string = "General Help";
    msgCompleted: string = "All data has been completed. No more suggestion.";
    // submitResponse: SubmitResponse = {} as SubmitResponse;
    showRequired: boolean = true;
    showWarnings: boolean = false;
    showRecommended: boolean = false;
    ediid: string = "";

    @Input() record: NerdmRes = null;
    @Input() helpContentAll: string = "";
    @Input() resourceType: string = "resource";
    @Output() sbarvisible_out = new EventEmitter<boolean>();

    // signal for scrolling to a section within the page
    @Output() scroll = new EventEmitter<string>();

    constructor(private chref: ChangeDetectorRef,
                public lpService: LandingpageService,
                private mdupdsvc: MetadataUpdateService,
                public sidebarService: SidebarService) { }

    ngOnInit(): void {
        this.msgCompleted = this.helpContentAll['completed']? this.helpContentAll['completed'] : "Default help text.<p>";
        this.lpService.watchSectionHelp((sectionHelp) => {
            this.updateHelpContent(sectionHelp);
        });
        
        this.ediid = this.record["@id"];
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if(changes.record){
            this.mdupdsvc.validate().subscribe((suggestions) => {
                this.suggestions = suggestions as ReviewResponse;
            })
    
            this.chref.detectChanges();
        }
    }

    get isTestData() {
        return this.ediid == "test1" || this.ediid == "test2";
    }

    get hasRequiredItems() {
        return this.mdupdsvc.hasRequiredItems();
    }

    get hasWarnItems() {
        return this.mdupdsvc.hasWarnItems();
    }

    get hasRecommendedItems() {
        return this.mdupdsvc.hasRecommendedItems();
    }

    get expandWarning() {
        return !this.hasRequiredItems && this.hasWarnItems;
    }

    get expandRec() {
        return !this.hasRequiredItems && !this.hasWarnItems && this.hasRecommendedItems;
    }

    /**
     * Update the help box text based on the input section data.
     * If topic is normal, display general help. Otherwise fetch the content from question-help.json based on section and topic.
     * @param sectionHelp section data
     */
    updateHelpContent(sectionHelp: SectionHelp) {
        // Update help content
        let generalHelp = this.helpContentAll[GENERAL]? this.helpContentAll[GENERAL] : "Default help text.<p>";

        if(sectionHelp.topic == HelpTopic[MODE.NORMAL]) {
            sectionHelp.section = GENERAL;
        }

        this.helpContent = generalHelp;
        if(sectionHelp.section && sectionHelp.section != GENERAL) {
            // Add general help of the section first
            if(this.helpContentAll[sectionHelp.section]){
                if(this.helpContentAll[sectionHelp.section][GENERAL]) {
                    this.helpContent = this.helpContentAll[sectionHelp.section][GENERAL]+ "<p><p>";
                }
            }

            // Add topic help
            if(sectionHelp.topic) {
                if(sectionHelp.topic != GENERAL && this.helpContentAll[sectionHelp.section]){
                    if(this.helpContentAll[sectionHelp.section][sectionHelp.topic])
                        this.helpContent += this.helpContentAll[sectionHelp.section][sectionHelp.topic] + "<p><p>";

                    if(sectionHelp.topic == HelpTopic[MODE.LIST] && this.helpContentAll[sectionHelp.section][HelpTopic["dragdrop"]])
                        this.helpContent += this.helpContentAll[sectionHelp.section][HelpTopic["dragdrop"]] + "<p><p>";
                }
            }

            // Add "see also" if available
            if(this.helpContentAll[sectionHelp.section] &&this.helpContentAll[sectionHelp.section][HelpTopic["seealso"]])
                        this.helpContent += this.helpContentAll[sectionHelp.section][HelpTopic["seealso"]] + "<p><p>";
            
        }else {
            this.helpContent = generalHelp;
        }   

        // Update help title
        if(this.helpContentAll[sectionHelp.section] && this.helpContentAll[sectionHelp.section]["label"])
            this.title = this.helpContentAll[sectionHelp.section]["label"].trim() + " Help";
        else
            this.title = SectionPrefs.getDispName(sectionHelp.section) + " Help";

        this.chref.detectChanges();
    }

    gotoSection(section: string) {
        if(section=="topic") section = "theme";
        // let sectionID = SectionPrefs.getFieldName(section);
        let sectionID = section;
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = sectionID;
        sectionHelp.topic = GENERAL;

        let sectionMode: SectionMode = {} as SectionMode;
        sectionMode.sender = this.fieldName;
        sectionMode.section = sectionID;
        sectionMode.mode = MODE.EDIT;

        this.lpService.setCurrentSection(sectionID);
        this.updateHelpContent(sectionHelp);

        this.lpService.setEditing(sectionMode);

        this.scroll.emit(sectionID);

        this.chref.detectChanges();
    }

    /**
     * toggle whether the sidebar is visible.  When this is called, a change in 
     * in the visiblity of the sidebar will be animated (either opened or closed).
     */
    toggleSbarView() {
        this.sbarvisible = ! this.sbarvisible;

        this.sidebarState = this.sbarvisible? 'sbvisible' : 'sbhidden';
        this.sbarvisible_out.next(this.sbarvisible);
        this.chref.detectChanges();
    }
}
