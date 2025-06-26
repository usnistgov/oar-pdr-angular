import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollapseModule } from '../../collapseDirective/collapse.module';
import { NerdmRes, NerdmComp, NERDResource } from '../../../nerdm/nerdm';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { Themes } from '../../../shared/globals/globals';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';

@Component({
    selector: 'accesspage-pub',
    standalone: true,
    imports: [ CommonModule, CollapseModule, NgbModule ],
    templateUrl: './accesspage-pub.component.html',
    styleUrls: ['../../landing.component.scss', './accesspage-pub.component.css'],
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
export class AccesspagePubComponent {
    accessPages: NerdmComp[] = [];
    editBlockExpanded: boolean = false;
    fieldName: string = SectionPrefs.getFieldName(Sections.ACCESS_PAGES);
    overflowStyle: string = 'hidden';
    nonAccessPages: NerdmComp[] = []; // Keep a copy of original record for update purpose
    scienceTheme = Themes.SCIENCE_THEME;

    @Input() record: NerdmRes = null;
    @Input() theme: string;
    @Input() isPublicSite: boolean = true;
    
    constructor( private gaService: GoogleAnalyticsService,
        public globalsvc: GlobalService,
        private chref: ChangeDetectorRef ) {
        
    }

    ngOnInit(): void {
        if (this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0){
            this.useMetadata();
        }
    }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record){
            this.useMetadata();  // initialize internal component data based on metadata
        }
            
        this.chref.detectChanges();
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
        this.accessPages = [] as NerdmComp[];
        if (this.record[this.fieldName]) {
            this.accessPages = this.selectAccessPages();

            // If this is a science theme and the collection contains one or more components 
            // that contain both AccessPage (or SearchPage) and DynamicSourceSet, 
            // we want to remove it from accessPages array since it's already displayed 
            // in the search result.
            if(this.theme == this.scienceTheme) 
                this.accessPages = this.accessPages.filter(cmp => ! cmp['@type'].includes("nrda:DynamicResourceSet"));
        }
    }
    
    /**
     * Get the section style based on different modes
     * @returns div style
     */
    getStyle(){
        return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
    }    

    /**
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    googleAnalytics(url: string, event, title) {
        this.gaService.gaTrackEvent('accesspage', event, title, url);
    }    
}
