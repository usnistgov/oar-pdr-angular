import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter, effect } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../nerdm/nerdm';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { Themes, ColorScheme, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { SearchresultModule } from '../searchresult/searchresult.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { AccesspageMidasComponent } from '../accesspage/accesspage-midas/accesspage-midas.component';
import { AccesspagePubComponent } from '../accesspage/accesspage-pub/accesspage-pub.component';
import { DatafilesPubComponent } from '../data-files/datafiles-pub/datafiles-pub.component';
import { DatafilesMidasComponent } from '../data-files/datafiles-midas/datafiles-midas.component';

/**
 * a component that lays out the "Data Access" section of a landing page.  This includes (as applicable)
 * the list of data files, links to data access pages, and access policies.  
 */
@Component({
    selector:      'pdr-resource-data',
    standalone: true,
    imports: [
        SectionTitleComponent,
        CommonModule,
        AccesspageMidasComponent,
        DatafilesPubComponent,
        DatafilesMidasComponent,
        SearchresultModule,
        AccesspagePubComponent,
        NgbModule
    ],
    templateUrl:   './resourcedata.component.html',
    styleUrls:   [
        './resourcedata.component.css',
        '../landing.component.scss'
    ],
    animations: [
        trigger(
          'enterAnimation', [
            transition(':enter', [
              style({height: '0px', opacity: 0}),
              animate('500ms', style({height: '100%', opacity: 1}))
            ]),
            transition(':leave', [
              style({height: '100%', opacity: 1}),
              animate('500ms', style({height: 0, opacity: 0}))
            //   animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
            ])
          ]
        )
    ]
})
export class ResourceDataComponent implements OnChanges {
    accessPages: NerdmComp[] = [];
    hasDRS: boolean = false;
    showDescription: boolean = false;
    showRestrictedDescription: boolean = false;
    currentState = 'initial';
    recordType: string = "";
    scienceTheme = Themes.SCIENCE_THEME;
    defaultTheme = Themes.DEFAULT_THEME;
    hasRights: boolean = true;
    colorScheme: ColorScheme;
    sectionTitle: string = "Data Access";
    collection: string;
    maxWidth: number = 1000;
    isEditMode: boolean = true;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    @Input() editEnabled: boolean; 
    @Input() theme: string = "default";
    @Input() isPublicSite: boolean = true;

    // pass out download status for metrics refresh
    @Output() dlStatus: EventEmitter<string> = new EventEmitter();

    // @ViewChild('dataAccessHeader') dataAccessHeader: ElementRef;

    /**
     * create an instance of the Identity section
     */
    constructor(public globalService: GlobalService,
                public edstatsvc: EditStatusService,
                private gaService: GoogleAnalyticsService)
    { 
        this.globalService.watchCollection((collection) => {
            this.collection = collection;
        });

        this.globalService.watchLpsLeftWidth(width => {
            this.maxWidth = width + 20;
        });

        effect(() => {
            this.isEditMode = this.edstatsvc.isEditMode();
        })
    }

    ngOnInit(): void {
        this.isEditMode = this.edstatsvc.isEditMode();
        this.recordType = (new NERDResource(this.record)).resourceLabel();

        this.colorScheme = {
            "default": "#257a2d",
            "light": "#6bad73",
            "lighter": "#f0f7f1",
            "dark": "#1c6022",
            "hover": "#ffffff" 
        };
    }

    ngOnChanges(ch : SimpleChanges) {
        if (this.record)
            this.useMetadata();  // initialize internal component data based on metadata
    }

    /**
     * initial this component's internal data used to drive the display based on the 
     * input resource metadata
     */
    useMetadata(): void {
        this.accessPages = [];
        if (this.record['components']) {
            this.accessPages = this.selectAccessPages();

            // If this is a science theme and the collection contains one or more components that contain both AccessPage (or SearchPage) and DynamicSourceSet, we want to remove it from accessPages array since it's already displayed in the search result.
            if(this.theme == this.scienceTheme) 
                this.accessPages = this.accessPages.filter(cmp => ! cmp['@type'].includes("nrda:DynamicResourceSet"));

            this.hasDRS = this.hasDynamicResourceSets();
        }
    }

    /**
     * select the AccessPage components to display, adding special disply options
     */
    selectAccessPages() : NerdmComp[] {
        let use: NerdmComp[] = (new NERDResource(this.record)).selectAccessPages();
        use = (JSON.parse(JSON.stringify(use))) as NerdmComp[];

        return use.map((cmp) => {
            if (! cmp['title']) cmp['title'] = cmp['accessURL'];

            cmp['showDesc'] = false;
            cmp['backcolor'] = 'white';

            return cmp;
        });
    }

    /**
     * return true if the components include non-hidden DynamicResourceSets.  If there are, the 
     * results from the DynamicResourceSet searches will be display in a special in-page 
     * search results display.
     */
    hasDynamicResourceSets(): boolean {
        return (new NERDResource(this.record)).selectDynamicResourceComps().length > 0;
    }

    /**
     * Emit download status
     * @param downloadStatus
     */
    setDownloadStatus(downloadStatus){
        this.dlStatus.emit(downloadStatus);
    }
    /**
     * For animation
     * initial - mouse out
     * final - mouse in
     */
    changeState() {
        this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
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

