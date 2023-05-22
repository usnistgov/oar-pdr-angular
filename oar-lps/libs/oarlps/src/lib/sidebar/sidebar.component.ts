import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { NerdmRes, NERDResource } from '../nerdm/nerdm';
import { LandingpageService } from '../landing/landingpage.service';
import { SidebarService } from './sidebar.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs } from '../shared/globals/globals';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger("togglesbar", [
        state('sbvisible', style({
            position: 'absolute',
            right: '0%',
            top: "20%",
            bottom: "100%"
        })),
        state('sbhidden', style({
            position: 'absolute',
            right: '-250%',
            top: "20%",
            bottom: "100%"
        })),
        transition('sbvisible <=> sbhidden', [
            animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
        ])
    ])
]
})
export class SidebarComponent implements OnInit {
    sbarvisible : boolean = true;
    sidebarState: string = 'sbvisible';
    helpContent: string = "";
    suggustedSections: any = {};
    fieldName: string = "sidebar";
    // required: string[] = [];
    // recommended: string[] = [];
    // niceToHave: string[] = [];

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
        this.lpService.watchSectionHelp((sectionHelp) => {
            this.updateHelpContent(sectionHelp);
        })
    }

    updateHelpContent(sectionHelp: SectionHelp) {
        let generalHelp = this.helpContentAll['general']? this.helpContentAll['general'] : "Default help text.<p>";

        this.helpContent = generalHelp;
        if(sectionHelp.section) {
            // Add general help of the section first
            if(this.helpContentAll[sectionHelp.section]){
                if(this.helpContentAll[sectionHelp.section]['general']) {
                    this.helpContent = this.helpContentAll[sectionHelp.section]['general']+ "<p>";
                }
            }

            // Add topic help
            if(sectionHelp.topic) {
                if(sectionHelp.topic != 'general' && this.helpContentAll[sectionHelp.section] && this.helpContentAll[sectionHelp.section][sectionHelp.topic]){
                    this.helpContent += this.helpContentAll[sectionHelp.section][sectionHelp.topic];
                }
            }
        }else {
            this.helpContent = generalHelp;
        }   

        this.suggustedSections = this.sidebarService.getSuggestions(this.record, this.resourceType);
        // this.required = this.suggustedSections['required'];
        // this.recommended = this.suggustedSections['recommended'];
        // this.niceToHave = this.suggustedSections['niceToHave'];
    }

    gotoSection(section: string) {
        let sectionID = SectionPrefs.getFieldName(section);
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = sectionID;
        sectionHelp.topic = "general";

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
