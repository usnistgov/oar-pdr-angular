import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, SimpleChanges, Self, ElementRef } from '@angular/core';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { NerdmRes } from '../nerdm/nerdm';
import { LandingpageService } from '../landing/landingpage.service';
import { SidebarService } from './sidebar.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, GENERAL, ReviewResponse } from '../shared/globals/globals';
import { HelpTopic } from '../landing/landingpage.service';
import { CommonModule } from '@angular/common';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { LandingConstants, SubmissionData, GlobalService } from '../shared/globals/globals';
import { EditStatusService } from '../landing/editcontrol/editstatus.service';
import { RevisionDetailsComponent } from '../landing/revision-details/revision-details.component';
import revisionhelp from '../../assets/site-constants/revision-help.json';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        SuggestionsComponent,
        RevisionDetailsComponent
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    animations: [
        trigger('slideToggle', [
            state(
                'visible',
                style({
                    transform: 'translateX(0)',
                    opacity: 1,
                    display: 'block',
                })
            ),
            state(
                'hidden',
                style({
                    transform: 'translateX(100%)',
                    opacity: 0,
                    display: 'none',
                })
            ),
            transition('visible => hidden', [animate('300ms ease-in')]),
            transition('hidden => visible', [animate('300ms ease-out')]),
        ]),
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
    sbarvisible: boolean = true;
    hideSidebarBody: boolean = false;
    sidebarState: string = 'sbvisible';
    helpContent: string = "";
    fieldName: string = "sidebar";
    DEFAULT_TITLE: string = "General Help";
    title: string = "General Help";
    msgCompleted: string = "All data has been completed. No more suggestion.";
    // submitResponse: SubmitResponse = {} as SubmitResponse;
    showRequired: boolean = true;
    showWarnings: boolean = false;
    showRecommended: boolean = false;
    ediid: string = "";
    _editType: string;
    EDIT_TYPES: any = LandingConstants.editTypes;
    submissionData = new SubmissionData();
    public revisionHelp:{} = revisionhelp;
    showRevisionHelp: boolean = false;
    showGeneralHelp: boolean = true;

    @Input() record: NerdmRes = null;
    @Input() helpContentAll: any = {};
    @Input() resourceType: string = "resource";
    @Input() suggestions: ReviewResponse = {} as ReviewResponse;
    @Output() sbarvisible_out = new EventEmitter<boolean>();

    // signal for scrolling to a section within the page
    @Output() scroll = new EventEmitter<string>();

    constructor(
        private chref: ChangeDetectorRef,
        public lpService: LandingpageService,
        public edstatsvc: EditStatusService,
        public globalService: GlobalService,
        @Self() private element: ElementRef,
        public sidebarService: SidebarService) { 
        
            this.edstatsvc.watchEditType((editType) => {
                this._editType = editType;
            })
        
            this.globalService.watchSubmissionData(
                (data) => {
                    this.submissionData = new SubmissionData(data);
            })
    }

    get maxHeight(): number {
        return this.element.nativeElement.firstChild.offsetHeight;
    }
    
    ngOnInit(): void {
        this.msgCompleted = this.helpContentAll['completed']? this.helpContentAll['completed'] : "Default help text.<p>";

        //Will be removed later
        this.lpService.watchSectionHelp((sectionHelp) => {
            this.updateHelpContent(sectionHelp);
        });
        
        //Use sidebar service so both step wizard and landing page can use
        this.sidebarService.watchSectionHelp((sectionHelp) => {
            this.updateHelpContent(sectionHelp);
        });

        if (this.record && this.record["@id"]) this.ediid = this.record["@id"];
        
        this.lpService.watchSubmitResponse((suggestions) => {
            this.suggestions = suggestions as ReviewResponse;
            this.chref.detectChanges();
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        // if(changes.record){
        //     this.mdupdsvc.validate().subscribe((suggestions) => {
        //         this.suggestions = suggestions as ReviewResponse;
        //     })
    
            this.chref.detectChanges();
        // }
    }

    get isTestData() {
        return this.ediid == "test1" || this.ediid == "test2";
    }

    get hasRequiredItems() {
        return this.suggestions && this.suggestions['req'] && this.suggestions['req'].length > 0;
    }

    get hasWarnItems() {
        return this.suggestions && this.suggestions['warn'] && this.suggestions['warn'].length > 0;
    }

    get hasRecommendedItems() {
        return this.suggestions && this.suggestions['warn'] && this.suggestions['warn'].length > 0;
    }

    get expandWarning() {
        return !this.hasRequiredItems && this.hasWarnItems;
    }

    get expandRec() {
        return !this.hasRequiredItems && !this.hasWarnItems && this.hasRecommendedItems;
    }

    get isRevision() {
        return this._editType == this.EDIT_TYPES.REVISE;
    }

    /**
     * Update the help box text based on the input section data.
     * If topic is normal, display general help. Otherwise fetch the content from question-help.json based on section and topic.
     * @param sectionHelp section data
     */
    updateHelpContent(sectionHelp: SectionHelp) {
        // Update help content
        let generalHelp = this.helpContentAll[GENERAL]? this.helpContentAll[GENERAL] : "Default help text.<p>";

        if (sectionHelp.showGeneral != false) {
            if(sectionHelp.topic == HelpTopic[MODE.NORMAL]) {
                sectionHelp.section = GENERAL;
            }
    
            this.helpContent = generalHelp;
        } else {
            this.helpContent = "";
        }

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
            this.title = this.helpContentAll[sectionHelp.section]["label"].trim();
        else
            this.title = SectionPrefs.getDispName(sectionHelp.section);

        this.chref.detectChanges();
    }

    gotoSection(section: string) {
        //For old topic structure
        // if(section=="topic") section = "theme";
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

        this.sidebarState = this.sbarvisible ? 'sbvisible' : 'sbhidden';
        
        if (!this.sbarvisible) {
            setTimeout(() => {
                this.hideSidebarBody = true;
                //Refresh screen
                this.chref.detectChanges();
            }, 350);
        } else {
            this.hideSidebarBody = false;
        }
        
        this.sbarvisible_out.next(this.sbarvisible);
        this.chref.detectChanges();
    }

    updateSubmissionData(event) {
        this.submissionData = event;

        //Broadcast the change
        this.globalService.setSubmissionData(this.submissionData);
    }

    processCommand(event) {
        if (event == "getHelp") {
            this.showRevisionHelp = !this.showRevisionHelp;

            if (this.showGeneralHelp) this.showGeneralHelp = false;
            else {
                //Before display suggestion, Delay 350ms to allow the help window to go away.
                setTimeout(() => {
                    this.showGeneralHelp = true;
                    //Refresh screen
                    this.chref.detectChanges();
                }, 350);
            }
        }
    }
}
