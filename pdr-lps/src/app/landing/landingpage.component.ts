// import { MessageBarComponent } from './../../../../oar-lps/libs/oarlps/src/lib/frame/messagebar.component';
import {
    Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef,
    PLATFORM_ID, Inject, ViewEncapsulation, HostListener, ElementRef
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpEventType } from '@angular/common/http';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { state, style, trigger, transition, animate } from '@angular/animations';
import questionhelp from '../../assets/site-constants/question-help.json';
import wordMapping from '../../assets/site-constants/word-mapping.json';
import * as REVISION_TYPES from '../../../../node_modules/oarlps/src/assets/site-constants/revision-types.json';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NoidComponent } from './noid.component';
import { CitationPopupComponent, DoneModule, SearchresultModule, DownloadStatusModule, FrameModule } from 'oarlps';
import { SidebarComponent, MetricsinfoComponent, MessageBarComponent } from 'oarlps';
import { AppConfig, NERDmResourceService, NerdmRes, NERDResource, IDNotFound } from 'oarlps';
import { GlobalService, LandingConstants, CartService, DataCartStatus, CartActions } from 'oarlps';
import { RecordLevelMetrics, MetricsService, MetricsData, formatBytes } from 'oarlps';
import { LandingBodyComponent, LandingpageService, MenuComponent } from 'oarlps';
import { Themes, ThemesPrefs, Collections } from 'oarlps';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * A component providing the complete display of landing page content associated with
 * a resource identifier.  This content is handle in various sub-components.
 *
 * Features include:
 * * an "identity" section, providing title, names, identifiers, and who is repsonsible
 * * description section, providing thd prose description/abstract, keywords, terms, ...
 * * a data access section, including a file listing (if files are availabe) and other links
 * * a references section
 * * tools and navigation section.
 *
 * This component sets the view encapsulation to None: this means that the style settings
 * defined in landingpage.component.css apply globally, including to all the child components.
 */
@Component({
    selector: 'pdr-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        NgbModule,
        SearchresultModule,
        DoneModule,
        DownloadStatusModule,
        LandingBodyComponent,
        CitationPopupComponent,
        MetricsinfoComponent,
        NoidComponent,
        SidebarComponent,
        MenuComponent,
        FrameModule
    ],
    providers: [
        Title, NgbActiveModal
    ],
    templateUrl: './landingpage.component.html',
    styleUrls: ['./landingpage.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger("togglemain", [
            state('mainsquished', style({
                "width": "{{lps_width}}"}), {params: {lps_width: '450px'}}
            ),
            state('mainexpanded', style({
                "width": "95%"
            })),
            state('mainfullyexpanded', style({
                "width": "100%"
            })),
            transition('mainsquished <=> mainexpanded', [
                animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            ])
        ]),
        trigger("togglesbar", [
            state('mainsquished', style({
                "width": "{{help_width}}"}), {params: {help_width: '450px'}}
            ),
            state('mainexpanded', style({
                "width": "15px"
            })),
            state('mainfullyexpanded', style({
                "width": "0%"
            })),
            transition('mainsquished <=> mainexpanded', [
                animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            ])
        ])
    ]
})
export class LandingPageComponent implements OnInit, AfterViewInit {
    isPublicSite = true;
    pdrid: string;
    layoutCompact: boolean = true;
    layoutMode: string = 'horizontal';
    profileMode: string = 'inline';
    md: NerdmRes = null;       // the NERDm resource metadata
    midasRecord: any = null;    // the new Midas record metadata
    reqId: string;             // the ID that was used to request this page
    inBrowser: boolean = false;
    citationVisible: boolean = false;
    public EDIT_MODES: any = LandingConstants.editModes;
    editMode: string = LandingConstants.editModes.VIEWONLY_MODE;
    editTypes = LandingConstants.editTypes;
    // reviseTypes: any = Globals.LandingConstants.reviseTypes;
    arrRevisionTypes: any[] = [];
    _showData: boolean = false;
    _showContent: boolean = false;
    headerObj: any;
    message: string;
    displaySpecialMessage: boolean = false;
    citationDialogWith: number = 550; // Default width
    recordLevelMetrics : RecordLevelMetrics;

    loadingMessage = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    dataCartStatus: DataCartStatus;
    fileLevelMetrics: any;
    metricsRefreshed: boolean = false;
    metricsData: MetricsData;
    showJsonViewer: boolean = false;

    //Default: wait 5 minutes (300sec) after user download a file then refresh metrics data
    delayTimeForMetricsRefresh: number = 300;
    cartChangeHandler: any;
    public CART_ACTIONS: CartActions;

    mobileMode: boolean = false;
    dialogOpen: boolean = false;
    modalReference: any;
    windowScrolled: boolean = false;
    btnPosition: number = 20;
    menuPosition: number = 20;
    topBarHeight: number = 150;
    bottomBarHeight: number = 170;
    showMetrics: boolean = false;
    recordType: string = "";
    imageURL: string = '';
    theme: string;
    scienceTheme = Themes.SCIENCE_THEME;
    defaultTheme = Themes.DEFAULT_THEME;
    hideToolMenu: boolean = true;

    private _sbarvisible : boolean = true;
    sidebarVisible: boolean = true;
    mainBodyStatus: string = "mainsquished";
    sidebarStartY: number = 200;
    sidebarY: number = 200;
    sidebarHeight: number = 400;

    // For help (sidebar)
    helpWidth: number = 300;
    helpWidthDefault: number = 300;
    helpMode: string = "normal";
    helpMaxWidth: number = 500;
    helpMinWidth: number = 200;

    // For the split bar between landing page body and help box
    splitterHeight: number = 500;
    mouse: any = {x:0, y:0};
    mouseDragging: boolean = false;
    prevMouseX: number = 0;
    prevHelpWidth: number = 0;
    lpsWidth: number = 500;
    lpsWidthForPreview: number = 500; // lps width for preview mode
    prevLpsWidth: number = 500; // Hold lps width if user switch view mode
    helpToggler: string = 'expanded';
    splitterPaddingTop: number = 0;
    pageYOffset: number = 0;
    widthForSplitter: number = 60;
    splitterX: number = 1000;

    scrollMaxHeight: number;
    wordMapping: any = wordMapping;
    resourceType: string = "resource";

    suggustedSections: string[] = ["title", "keyword", "references"];
    public helpContentAll:{} = questionhelp;
    helpContentUpdated: boolean = false;
    collection: string = Collections.DEFAULT;
    collectionObj: any;
    displayBanner: boolean = true;
    showStickMenu: boolean = false;
    landingPageURL: string;
    landingPageServiceStr: string;


    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
        event.stopPropagation();
        this.showStickMenu = false;
    }

    @ViewChild(LandingBodyComponent)
    landingBodyComponent: LandingBodyComponent;

    // @ViewChild(MetricsinfoComponent)
    // metricsinfoComponent: MetricsinfoComponent;

    @ViewChild('stickyButton') btnElement: ElementRef;
    @ViewChild('stickyMenu') menuElement: ElementRef;
    @ViewChild('lpscontent') lpscontent: ElementRef;
    @ViewChild('splitter') splitter: ElementRef;

    /**
     * create the component.
     * @param route   the requested URL path to be fulfilled with this view
     * @param router  the router to use to reroute output, if necessary
     * @param titleSv the Title service (used to set the browser's title bar)
     * @param cfg     the app configuration data
     * @param mdserv  the MetadataService for gaining access to the NERDm metadata.
     * @param res     a CurrentResource object for sharing the metadata and requested
     *                 ID with child components.
     */
    constructor(private route: ActivatedRoute,
                private router: Router,
                @Inject(PLATFORM_ID) private platformId: Object,
                public titleSv: Title,
                private cfg: AppConfig,
                private nerdmReserv: NERDmResourceService,
                private cartService: CartService,
                public metricsService: MetricsService,
                public breakpointObserver: BreakpointObserver,
                private chref: ChangeDetectorRef,
                public globalService: GlobalService,
                public lpService: LandingpageService,
                private http: HttpClient)
    {
        // Init the size of landing page body and the help box
        this.updateScreenSize();

        this.reqId = this.requestedIDfromRoute(this.route).replace('ark:/88434/', '');
        this.inBrowser = isPlatformBrowser(platformId);
        this.editMode = this.EDIT_MODES.VIEWONLY_MODE;
        this.delayTimeForMetricsRefresh = +this.cfg.get("delayTimeForMetricsRefresh", "300");
        this.getCollection();
        this.loadBannerUrl();

        this.lpService.watchCurrentSection((currentSection) => {
            this.goToSection(currentSection);
        });

        this.hideToolMenu = false;
    }

    get showSplitter() {
        return (this.mainBodyStatus == "mainsquished") && !this.mobileMode && this.hideToolMenu;
    }

    getCollection() {
        if(this.reqId.includes("pdr0-0001"))
            this.collection = Collections.FORENSICS;
        else if(this.reqId.includes("pdr0-0002"))
            this.collection = Collections.SEMICONDUCTORS;
        else
            this.collection = Collections.DEFAULT;

        this.globalService.setCollection(this.collection);
    }

    loadBannerUrl() {
        const CollectionData1: any  = require('../../assets/site-constants/collections.json');
        this.collectionObj = CollectionData1[this.collection] as any;

        switch(this.collection) {
            case Collections.FORENSICS: {
                this.imageURL = this.collectionObj.bannerUrl;
                break;
            }
            case Collections.SEMICONDUCTORS: {
                this.imageURL = this.collectionObj.bannerUrl;
                break;
            }
            default: {
                this.imageURL = "";
                break;
            }
        }

        setTimeout(() => {
            // this.displayBanner = true;
        }, 0);
    }

    protected requestedIDfromRoute(route : ActivatedRoute) : string {
        return route.snapshot.url.map(u => u.toString()).join('/');
    }

    get citationtext() {
        return (new NERDResource(this.md)).getCitation();
    }
    /**
     * initialize the component.  This is called early in the lifecycle of the component by
     * the Angular rendering infrastructure.
     */
    ngOnInit() {
        this.landingPageURL = this.cfg.get('links.pdrIDResolver','/od/id/');
        this.landingPageServiceStr = this.cfg.get('links.pdrIDResolver','https://data.nist.gov/od/id/');
  
        this.arrRevisionTypes = REVISION_TYPES["default"];
        this.recordLevelMetrics = new RecordLevelMetrics();
        this.displaySpecialMessage = false;
        this.CART_ACTIONS = CartActions.cartActions;

        if(this.inBrowser){
            this.cartChangeHandler = this.cartChanged.bind(this);
            window.addEventListener("storage", this.cartChangeHandler);
        }
        this.metricsData = new MetricsData();

        // Clean up cart status storage
        if(this.inBrowser){
            this.dataCartStatus = DataCartStatus.openCartStatus();
            this.dataCartStatus.cleanUpStatusStorage();
        }

        this.globalService.setShowLPContent(true);
        this.loadPublicData();
    }

    loadPublicData() {
        let metadataError = "";

        this.nerdmReserv.getResource(this.reqId, this.inBrowser).subscribe(
            (data) => {
            // successful metadata request
            this.md = data;

            if (!this.md) {
                // id not found; reroute
                console.error("No data found for ID=" + this.reqId);
                metadataError = "not-found";
            }
            else{
                this.pdrid = this.md["@id"];
                this.theme = ThemesPrefs.getTheme((new NERDResource(this.md)).theme());

                if(this.inBrowser){
                        if(this.theme == Themes.DEFAULT_THEME)
                            this.getMetrics();
                }

                // proceed with rendering of the component
                this.useMetadata();

                if (this.inBrowser) {
                    // Display content after 15sec no matter what
                    setTimeout(() => {
                        this.globalService.setShowLPContent(true);
                    }, 15000);
                }
            }

            if(this.inBrowser)
                this._showContent = true;
                
            if (metadataError == "not-found") {
                this.router.navigateByUrl("not-found/" + this.reqId, { skipLocationChange: true });
            }
        },
        (err) => {
            this.globalService.setShowLPContent(true);
            if (err instanceof IDNotFound) {
                console.error("ID not found - navigating to not-found page: ", err);
                metadataError = "not-found";
                this.router.navigateByUrl("not-found/" + this.reqId, { skipLocationChange: true });
            }
            else {
                console.error("Failed to retrieve metadata: ", err);
                metadataError = "int-error";
                // this.router.navigateByUrl("int-error/" + this.reqId, { skipLocationChange: true });
                this.router.navigateByUrl("int-error/" + this.reqId, { skipLocationChange: true });
            }
        });
    }

    /**
     * Get metrics data
     */
     getMetrics() {
        let ediid = this.md.ediid;
        let that = this;

        //Get record level metrics
         this.metricsService.getRecordLevelMetrics(ediid).subscribe(
             async (event) => {
                 if (event.type == HttpEventType.Response) {
                     let response = await event.body.text();

                     that.recordLevelMetrics = JSON.parse(await event.body.text());
                     that.handleRecordLevelData();
                 }
            },
            (err) => {
                console.error("Failed to retrieve dataset metrics: ", err);
                this.metricsData.hasCurrentMetrics = false;
                this.showMetrics = true;
                this.metricsData.dataReady = true;
            });
    }

    /**
     * Handle record level data.
     * If only one record in DataSetMetrics, just use it. Otherwise check if pdrid matches 
     * Nerdm record's pdrid. If yes, use it. Otherwise return false.
     * @returns true if there is valid record level data record
     */
    handleRecordLevelData() {
        let met: any = null;

        if(this.recordLevelMetrics.DataSetMetrics) {
            if(this.recordLevelMetrics.DataSetMetrics.length > 1) {
                for(let metrics of this.recordLevelMetrics.DataSetMetrics) {
                    if(metrics["pdrid"] && (metrics["pdrid"].toLowerCase() == 'nan' || metrics["pdrid"].trim() == this.pdrid) && metrics["last_time_logged"]){
                        met = metrics;
                    }
                }
            }else if(this.recordLevelMetrics.DataSetMetrics.length == 1){
                met = this.recordLevelMetrics.DataSetMetrics[0];
            }
        }

        if(met) {
            this.metricsData.totalDatasetDownload = met.record_download;
            this.metricsData.totalDownloadSize = met["total_size_download"];
            this.metricsData.totalUsers = met.number_users;

            this.metricsData.hasCurrentMetrics = true;
            this.metricsData.dataReady = true;
            this.showMetrics = true;
        }else{
            this.metricsData.hasCurrentMetrics = false;
            this.showMetrics = true;
            this.metricsData.dataReady = true;
        }
    }


    /**
     * Detect window scroll
     */
    @HostListener("window:scroll", [])
    onWindowScroll() {
        this.scrollMaxHeight = document.body.scrollHeight - window.innerHeight;

        if(this.mobileMode)
            this.windowScrolled = (window.pageYOffset > this.btnPosition);
        else
            this.windowScrolled = (window.pageYOffset > this.menuPosition);

        this.sidebarY = this.sidebarStartY - window.pageYOffset;
        this.sidebarY = this.sidebarY < 0 ? 0 : this.sidebarY;

        this.updateSidbarHeight();
        this.updateSplitterHeight();

        this.splitterPaddingTop += window.pageYOffset - this.pageYOffset;
        this.pageYOffset = window.pageYOffset;
    }

    /**
     * When storage changed, if it's dataCartStatus and action is "set download completed",
     * we want to refresh the metrics after certain period of time.
     *
     * @param ev Event - storage changed
     */
    cartChanged(ev){
       if(ev.key == this.dataCartStatus.getName()){
           let newValue = JSON.parse(ev.newValue);
           setTimeout(() => {
               this.dataCartStatus.restore();
               if(newValue.action == this.CART_ACTIONS["SET_DOWNLOAD_COMPLETE"]){
                   this.refreshMetrics();
               }
           }, 10);
       }
    }

    /**
     * Refresh metrics data in N minutes. N is defined in environment.ts
     * @param delay if this is false, refresh immediately
     */
    refreshMetrics(delay:boolean = true){
        let delayTime;
        if(delay){
            console.log("Metrics will be refreshed in " + this.delayTimeForMetricsRefresh + " seconds.");
            delayTime = this.delayTimeForMetricsRefresh*1000;
        }else{
            delayTime = 0;
        }

        setTimeout(() => {
            this.getMetrics();
        }, delayTime);
    }

    /**
     * Handle download status change event.
     *
     * @param downloadStatus download status of a direct download event. Currently only handle "downloaded" status.
     */
    onDownloadStatusChanged(downloadStatus) {
        if(typeof downloadStatus === 'string') {
            if(downloadStatus == "downloaded") {
                this.refreshMetrics();
            }
        }else{
            console.error("Invalid event type", typeof event);
        }
    }

    setCitationVisible(citationVisible) {
        this.citationVisible = citationVisible;
    }

    /**
     * Reture record level total download size
     */
    get totalDownloadSize() {
        if(this.recordLevelMetrics.DataSetMetrics[0] != undefined)
            return formatBytes(this.recordLevelMetrics.DataSetMetrics[0].total_size_download, 2);
        else
            return "";
    }

    /**
     * apply housekeeping after view has been initialized
     */
    ngAfterViewInit() {
        if(this.inBrowser) {
            this.sidebarHeight = window.innerHeight - 250;

            if (this.splitter) {
              this.splitterX = this.splitter.nativeElement.offsetLeft + 6;
            }

            //Set the position of the sticky menu (or menu button)
            setTimeout(() => {
                this.setMenuPosition();
                this.updateScreenSize();
            }, 0);
        }

        if (this.md && this.inBrowser) {
            this.useFragment();

            window.history.replaceState({}, '', '/od/id/' + this.reqId);
        }
    }

    /**
     * Update the height of the help box
     */
    updateSidbarHeight() {
        // The height of the help box
        // should be windows inner height minus the height of the remaining of the top bar
        // minus the visible height of the bottom bar minus margin (50)

        let visibleTopBarHeight = this.topBarHeight - window.pageYOffset + 50;
        visibleTopBarHeight = visibleTopBarHeight > 0 ? visibleTopBarHeight : 0;

        let visibleBottomBarHeight = this.bottomBarHeight - this.scrollMaxHeight + window.pageYOffset;
        visibleBottomBarHeight = visibleBottomBarHeight > 0 ? visibleBottomBarHeight : 0;

        this.sidebarHeight = window.innerHeight - visibleTopBarHeight - visibleBottomBarHeight - 50;
    }

    /**
     * Set the position of the sticky menu (or menu button)
     */
    setMenuPosition() {
        // Bootstrap breakpoint observer (to switch between desktop/mobile mode)
        // The breakpoint for PrimeNG menu is 750. For some reason the following min-width
        // need to set to 768 to be able to change the state at 750px.
        if(this.inBrowser){
            this.breakpointObserver
            .observe(['(min-width: 768px)'])
            .subscribe((state: BreakpointState) => {
                if (state.matches) {
                    this.mobileMode = false;
                    if (this.menuElement){
                        this.menuPosition = this.menuElement.nativeElement.offsetTop - 40;
                    }
                } else {
                    this.mobileMode = true;
                    if (this.btnElement)
                        this.btnPosition = this.btnElement.nativeElement.offsetTop + 10;
                }

                this.lpService.setMobileMode(this.mobileMode);
            });
        }
    }

    inViewMode() {
        return this.editMode == this.EDIT_MODES.VIEWONLY_MODE;
    }

    get inEditMode() {
        return this.editMode == this.EDIT_MODES.EDIT_MODE;
    }

    showData() : void{
        if (this.md != null) {
            this._showData = true;
            setTimeout(() => {
                this.setMenuPosition();
                this.updateScreenSize();
            }, 0);
        }else
            this._showData = false;
    }

    /**
     * make use of the metadata to initialize this component.  This is called asynchronously
     * from ngOnInit after the metadata has been successfully retrieved (and saved to this.md).
     *
     * This method will:
     *  * set the page's title (as displayed in the browser title bar).
     */
    useMetadata(): void {
        this.metricsData.url = "/metrics/" + this.reqId;
        this.recordType = (new NERDResource(this.md)).resourceLabel();

        // set the document title
        this.setDocumentTitle();
        if (this.inBrowser) {
            this.showData();
        }
    }

    /**
     * set the document's title.
     */
    setDocumentTitle(): void {
        let title = "PDR: ";
        if (this.md['abbrev']) title += this.md['abbrev'] + " - ";
        if (this.md['title'])
            title += this.md['title']
        else
            title += this.md['@id']
        this.titleSv.setTitle(title);
    }

    /**
     * return the current document title
     */
    getDocumentTitle(): string { return this.titleSv.getTitle(); }

    /**
     * apply the URL fragment by scrolling to the proper place in the document
     */
    public useFragment() {
        this.router.events.subscribe(s => {
            if (s instanceof NavigationEnd) {
                const tree = this.router.parseUrl(this.router.url);
                let element = null;
                if (tree.fragment) {
                    element = document.querySelector("#" + tree.fragment);
                }
                else {
                    element = document.querySelector("body");
                    if (!element)
                        console.warn("useFragment: failed to find document body!");
                }
                if (element) {
                    //element.scrollIntoView();
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                    }, 1);
                }
            }
        });
    }

    /**
     * scroll the view to the named section.
     *
     * This funtion delegates the scrolling to the LandingBodyComponent which defines the available
     * sections.
     */
    goToSection(sectionId: string) {
        // If sectionID is "Metadata", scroll to About This Dataset and display JSON viewer
        this.showJsonViewer = (sectionId == "Metadata");
        if(sectionId == "Metadata") sectionId = "about";

        setTimeout(() => {
            if(this.landingBodyComponent != undefined)
                this.landingBodyComponent.goToSection(sectionId);
        }, 50);
    }

    /**
     * display or hide citation information in a popup window.
     * @param yesno   whether to show (true) or hide (false)
     */
    showCitation(yesno: boolean): void {
        this.citationVisible = yesno;
    }

    /**
     * toggle the visibility of the citation pop-up window
     * @param size
     */
    toggleCitation(size: string) : void {
        if(size == 'small')
            this.citationDialogWith = 400;
        else
            this.citationDialogWith = 550;

        this.citationVisible = !this.citationVisible;
    }

    /**
     * Set the message to display based on the edit mode.
     */
    setMessage() {
        if (this.editMode == this.EDIT_MODES.DONE_MODE)
            this.message = 'You can now close this browser tab <p>and go back to MIDAS to either accept or discard the changes.'

        if (this.editMode == this.EDIT_MODES.OUTSIDE_MIDAS_MODE)
            this.message = 'This record is not currently available for editing. <p>Please return to MIDAS and click "Edit Landing Page" to edit.'
    }

    /**
     * Setup landing page layout
     */
    landingpageClass() {
        if(this.mobileMode){
            return "col-12 md:col-12 lg:col-12 sm:flex-nowrap";
        }else{
            "col-10 md:col-10 lg:col-10 sm:flex-nowrap";
        }
    }

    /**
     * toggle whether the sidebar is visible.  When this is called, a change in
     * in the visiblity of the sidebar will be animated (either opened or closed).
     */
    toggleSbarView() {
        this._sbarvisible = ! this._sbarvisible;
        this.chref.detectChanges();
    }

    isSbarVisible() {
        return this._sbarvisible
    }

    updateSidebarStatus(sbarVisible) {
        this.sidebarVisible = sbarVisible;
        let helpWidth = null;
        if(this.mobileMode){
            this.helpWidth = 0;
            this.lpsWidth = window.innerWidth;
            this.mainBodyStatus = "mainfullyexpanded";
        }else {
            if(this.sidebarVisible){
              this.helpWidth = window.innerWidth * 0.35;
              this.lpsWidth = window.innerWidth - this.helpWidth - 140;

              this.mainBodyStatus = "mainsquished";

            }else{
                this.helpWidth = window.innerWidth * 0.05;
                this.lpsWidth = window.innerWidth * 0.95 - 0;
                this.mainBodyStatus = "mainexpanded";
            }
        }

          this.updateScreenSize(0, helpWidth);
    }

    /**
     *  Following functions detect screen size
     */
    @HostListener("window:resize", [])
        public onResize() {
            this.updateScreenSize();
    }

    private updateScreenSize(diff: number = 0, helpWidth: number=null) {
        setTimeout(() => {
            if(this.inBrowser){
              switch (this.mainBodyStatus){
                case 'mainexpanded':
                  // this.helpWidth = window.innerWidth * 0.05;
                  // this.lpsWidth = window.innerWidth * 0.95;
                  this.helpWidth = 50;
                  this.lpsWidth = window.innerWidth;
                  break;
                case 'mainfullyexpanded':
                  this.helpWidth = 0;
                  this.lpsWidth = window.innerWidth;
                  break;
                default: //mainsquished
                  // this.helpWidth = window.innerWidth - this.splitterX - 120;
                  if(helpWidth) this.helpWidth = helpWidth;
                  else this.helpWidth = this.helpWidth - diff;

                  this.lpsWidth = window.innerWidth - this.helpWidth - 120;

                  this.helpMaxWidth = window.innerWidth / 2;
                  this.sidebarHeight = window.innerHeight - this.topBarHeight - 50;
                  this.pageYOffset = window.pageYOffset;
                  this.splitterPaddingTop = (window.innerHeight - this.topBarHeight) / 2 - 100;
                  // this.helpWidth = window.innerWidth * 0.37;
                  this.helpWidth = this.helpWidth < this.helpMinWidth? this.helpMinWidth : this.helpWidth;
                  this.lpsWidthForPreview = window.innerWidth * .75;
                  break;
              }

                // this.helpMaxWidth = window.innerWidth / 2;
                // this.sidebarHeight = window.innerHeight - this.topBarHeight - 50;
                // this.pageYOffset = window.pageYOffset;
                this.updateSplitterHeight();
                // this.splitterPaddingTop = (window.innerHeight - this.topBarHeight) / 2 - 100;
                // this.helpWidth = window.innerWidth * 0.37;
                // this.helpWidth = this.helpWidth < this.helpMinWidth? this.helpMinWidth : this.helpWidth;

                this.setLpsWidth();
            }
        }, 0);
    }


    setLpsWidth() {
      if(this.hideToolMenu){
          this.lpsWidth = window.innerWidth - this.helpWidth - 160;
          // this.globalService.setLpsLeftWidth(this.lpsWidth);
          this.globalService.setLpsLeftWidth(this.lpsWidth - this.widthForSplitter);
      }else{
          // this.mainBodyStatus = "mainsquished";
          this.prevLpsWidth = this.lpsWidth;
          // this.lpsWidth = this.lpsWidthForPreview;

          if(!this.mobileMode) {
            this.lpsWidth = window.innerWidth - 450;
          }
          //Preview mode
          //In preview mode, the width of the right side menu is 18% of of the page width
          //So left side should be 80% of the page width (splitter also need some space)
          this.globalService.setLpsLeftWidth(this.lpsWidth);
      }

    }

    updateSplitterHeight() {
        if(this.lpscontent){
            this.splitterHeight = this.lpscontent.nativeElement.offsetHeight;
        }
    }

    // The following mouse functions handle drag action
    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent){
        this.mouse = {
            x: event.clientX,
            y: event.clientY
        }

        if(this.mouseDragging) {
          this.splitterX = this.mouse.x;

          let diff = this.mouse.x - this.prevMouseX;
            // this.helpWidth = this.prevHelpWidth - diff;
            // this.helpWidth = this.helpWidth < this.helpMinWidth? this.helpMinWidth : this.helpWidth > this.helpMaxWidth? this.helpMaxWidth : this.helpWidth;

            // this.updateSidbarHeight();
            // this.setLpsWidth(this.helpWidth);
            // this.updateSplitterHeight();

            this.prevMouseX = this.mouse.x;
            this.prevHelpWidth = this.helpWidth;
            this.updateScreenSize(diff, null);
        }
    }

    onMousedown(event) {
        this.prevMouseX = this.mouse.x;
        this.mouseDragging = true;
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event) {
        this.mouseDragging = false;
    }

    toggleMenu(event){
      event.stopPropagation();
      this.showStickMenu = !this.showStickMenu
    }
}
