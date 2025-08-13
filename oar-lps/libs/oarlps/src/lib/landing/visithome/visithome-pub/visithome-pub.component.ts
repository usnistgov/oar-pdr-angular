import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { Themes, Collections } from '../../../shared/globals/globals';
import { Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'Visithome-pub',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, FormsModule
  ],
  templateUrl: './visithome-pub.component.html',
  styleUrls: ['./visithome-pub.component.scss', '../../landing.component.scss']
})
export class VisithomePubComponent {
    collectionOrder: string[] = [Collections.DEFAULT];
    allCollections: any = {};

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;
    @Input() theme: string;
    @Input() collection: string = Collections.DEFAULT;
    @Input() isPublicSite: boolean = true;

    fieldName = SectionPrefs.getFieldName(Sections.VISIT_HOME_PAGE);
    scienceTheme = Themes.SCIENCE_THEME;
    visitHomeURL: string = "";
    overflowStyle: string = 'hidden';
    
    constructor(public globalsvc: GlobalService,
                public collectionService: CollectionService,
                private chref: ChangeDetectorRef,
                private gaService: GoogleAnalyticsService) { 

        this.collectionOrder = this.collectionService.getCollectionForDisplay();
        this.allCollections = this.collectionService.loadAllCollections();

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
        let color = this.allCollections[this.collection].color;

        return {
            '--button-text-color': 'white',
            '--button-color': color.defaultVar,
            '--hover-color': color.hoverVar,
            '--disable-color': 'var(--disabled-grey)',
            '--disable-text-color': 'var(--disabled-grey-text)'
        };
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
