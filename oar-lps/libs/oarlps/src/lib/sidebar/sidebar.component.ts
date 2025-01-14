import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { NerdmRes, NERDResource } from '../nerdm/nerdm';
import { LandingpageService } from '../landing/landingpage.service';
import { SidebarService } from './sidebar.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, GENERAL, SubmitResponse } from '../shared/globals/globals';
import { HelpTopic } from '../landing/landingpage.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule
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
        trigger('recommendedExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('niceToHaveExpand', [
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
    suggustedSections: any = {};
    fieldName: string = "sidebar";
    DEFAULT_TITLE: string = "General Help";
    title: string = "General Help";
    msgCompleted: string = "All data has been completed. No more suggestion.";
    submitResponse: SubmitResponse = {} as SubmitResponse;
    showRequired: boolean = true;
    showRecommeded: boolean = false;
    showNiceToHave: boolean = false;
    ediid: string = "";

    // helpContent: any = {
    //     "title": "<p>With this question, you are telling us the <i>type</i> of product you are publishing. Your publication may present multiple types of products--for example, data plus software to analyze it--but, it is helpful for us to know what you consider is the most important product. And don't worry: you can change this later. <p> <i>[Helpful examples, links to policy and guideance]</i>", "description": "Placeholder for description editing help."
    // }

    @Input() record: NerdmRes = null;
    @Input() helpContentAll: string = "";
    @Input() resourceType: string = "resource";
    @Output() sbarvisible_out = new EventEmitter<boolean>();
    // @Output() section = new EventEmitter<string>();

    // signal for scrolling to a section within the page
    @Output() scroll = new EventEmitter<string>();

    constructor(private chref: ChangeDetectorRef,
                public lpService: LandingpageService,
                public sidebarService: SidebarService) { 


    }

    ngOnInit(): void {
        this.msgCompleted = this.helpContentAll['completed']? this.helpContentAll['completed'] : "Default help text.<p>";
        this.lpService.watchSectionHelp((sectionHelp) => {
            this.updateHelpContent(sectionHelp);
        });

        this.lpService.watchSubmitResponse((response) => {
            this.submitResponse = response;

            this.showRecommeded = !this.hasRequiredItems;
            this.showNiceToHave = !this.hasRequiredItems && !this.hasRecommendedItems;
        });
        
        this.ediid = this.record["@id"];
    }

    get isTestData() {
        return this.ediid == "test1" || this.ediid == "test2";
    }

    get hasRequiredItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.failures &&  this.submitResponse.validation.failures.length > 0;
    }

    get hasRecommendedItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.warnings &&  this.submitResponse.validation.warnings.length > 0;
    }

    get hasNiceToHaveItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.recommendations &&  this.submitResponse.validation.recommendations.length > 0;
    }

    /**
     * Generate next steps list
     * @param response Response from server side validation
     */
    generateNextSteps(response: SubmitResponse) {

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

        this.suggustedSections = this.sidebarService.getSuggestions(this.record, this.resourceType);
        // this.required = this.suggustedSections['required'];
        // this.recommended = this.suggustedSections['recommended'];
        // this.niceToHave = this.suggustedSections['niceToHave'];
    }

    gotoSection(section: string) {
        let sectionID = SectionPrefs.getFieldName(section);
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
        // this.section.next(sectionID);

        this.scroll.emit(sectionID);
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
