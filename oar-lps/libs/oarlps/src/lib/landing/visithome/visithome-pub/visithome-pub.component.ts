import { Component, Input, SimpleChanges } from '@angular/core';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { Themes } from '../../../shared/globals/globals';
import { Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'Visithome-pub',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './visithome-pub.component.html',
  styleUrls: ['./visithome-pub.component.scss', '../../landing.component.scss']
})
export class VisithomePubComponent {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;
    @Input() theme: string;

    fieldName = SectionPrefs.getFieldName(Sections.VISIT_HOME_PAGE);
    scienceTheme = Themes.SCIENCE_THEME;
    visitHomeURL: string = "";
    overflowStyle: string = 'hidden';
    
    constructor(public globalsvc: GlobalService,
                private gaService: GoogleAnalyticsService) { 
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    updateOriginal(){
        this.visitHomeURL = "";

        if(this.hasVisitHomeURL) {
            this.visitHomeURL = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        }
    }

    get hasVisitHomeURL() {
        if(!this.record) return false;
        else return this.isExternalHomePage(this.record[this.fieldName]);
    }

    /**
     * return true if the given URL does not appear to be a PDR-generated home page URL.
     * Note that if the input URL is not a string, false is returned.  
     */
    public isExternalHomePage(url : string) : boolean {
        if (! url)
            return false;
        let pdrhomeurl = /^https?:\/\/(\w+)(\.\w+)*\/od\/id\//
        return ((url.match(pdrhomeurl)) ? false : true);
    }

    /**
     * Return visit homepage button style
     * @returns 
     */
    visitHomePageBtnStyle() {
        // if (!this.hasVisitHomeURL) {
        //     return {
        //         'opacity': '0.3',
        //         'color': 'black',
        //         'cursor': 'default'
        //     }
        // }
        if(this.theme == this.scienceTheme) {
            return {
                '--button-color': 'var(--science-theme-background-default)',
                '--hover-color': 'var(--science-theme-background-light2)'
            };
        }else{
            return {
                '--button-color': 'var(--nist-green-default)',
                '--hover-color': 'var(--nist-green-light)'
            };
        }
    }

    /**
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    googleAnalytics(url: string, event, title) {
        this.gaService.gaTrackEvent('homepage', event, title, url);
    }
 
}
