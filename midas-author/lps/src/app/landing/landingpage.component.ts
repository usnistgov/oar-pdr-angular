import {
    Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef,
    PLATFORM_ID, Inject, ViewEncapsulation, HostListener, ElementRef
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpEventType } from '@angular/common/http';

import { AppConfig } from 'oarlps';
import { MetadataService } from 'oarlps';
import { EditStatusService } from 'oarlps';
import { NerdmRes, NERDResource } from 'oarlps';
import { IDNotFound } from 'oarlps';
import { MetadataUpdateService } from 'oarlps';
import { LandingConstants } from './constants';
import { CartService } from 'oarlps';
import { DataCartStatus } from 'oarlps';
import { CartConstants } from 'oarlps';
import { RecordLevelMetrics } from 'oarlps';
import { MetricsService } from 'oarlps';
import { formatBytes } from 'oarlps';
import { LandingBodyComponent } from './landingbody.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
// import { MetricsinfoComponent } from './metricsinfo/metricsinfo.component';
import { CartActions } from 'oarlps';
// import { initBrowserMetadataTransfer } from 'oarlps';
import { MetricsData } from "oarlps";
import { Themes, ThemesPrefs } from 'oarlps';
import { state, style, trigger, transition, animate } from '@angular/animations';
import { LandingpageService } from 'oarlps';
import questionhelp from '../../assets/site-constants/question-help.json';
import wordMapping from '../../assets/site-constants/word-mapping.json';

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
    templateUrl: './landingpage.component.html',
    styleUrls: ['./landingpage.component.scss'],
    providers: [
        Title
    ],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger("togglemain", [
            state('mainsquished', style({
                "width": "75%"
            })),
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
                "width": "22%"
            })),
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
    layoutCompact: boolean = true;
    layoutMode: string = 'horizontal';
    profileMode: string = 'inline';
    md: NerdmRes = null;       // the NERDm resource metadata
    midasRecord: any = null;    // the new Midas record metadata
    reqId: string;             // the ID that was used to request this page
    inBrowser: boolean = false;
    citetext: string = null;
    citationVisible: boolean = false;
    editEnabled: boolean = false;
    public EDIT_MODES: any = LandingConstants.editModes;
    editMode: string = LandingConstants.editModes.VIEWONLY_MODE;
    editRequested: boolean = false;
    _showData: boolean = false;
    _showContent: boolean = true;
    headerObj: any;
    message: string;
    displaySpecialMessage: boolean = false;
    citationDialogWith: number = 550; // Default width
    recordLevelMetrics : RecordLevelMetrics;

    loadingMessage = '<i class="faa faa-spinner faa-spin"></i> Loading...';

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
    // menuBottom: string = "1em";
    showMetrics: boolean = false;
    recordType: string = "";
    imageURL: string;
    theme: string;
    scienceTheme = Themes.SCIENCE_THEME;
    defaultTheme = Themes.DEFAULT_THEME;
    hideToolMenu: boolean = false;

    private _sbarvisible : boolean = true;
    sidebarVisible: boolean = true;
    mainBodyStatus: string = "mainsquished";
    sidebarStartY: number = 100;
    sidebarY: number = 100;

    // helpContent: any = {
    //     "title": "<p>With this question, you are telling us the <i>type</i> of product you are publishing. Your publication may present multiple types of products--for example, data plus software to analyze it--but, it is helpful for us to know what you consider is the most important product. And don't worry: you can change this later. <p> <i>[Helpful examples, links to policy and guideance]</i>", "description": "Placeholder for description editing help."
    // }

    wordMpping: any = wordMapping;
    resourceType: string = "resource";

    suggustedSections: string[] = ["title", "keyword", "references"];
    public helpContentAll:{} = questionhelp;
    helpContentUpdated: boolean = false;

    @ViewChild(LandingBodyComponent)
    landingBodyComponent: LandingBodyComponent;

    // @ViewChild(MetricsinfoComponent)
    // metricsinfoComponent: MetricsinfoComponent;

    @ViewChild('stickyButton') btnElement: ElementRef;
    @ViewChild('stickyMenu') menuElement: ElementRef;
    @ViewChild('test') test: ElementRef;

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
                private mdserv: MetadataService,
                public edstatsvc: EditStatusService,
                private cartService: CartService,
                private mdupdsvc: MetadataUpdateService,
                public metricsService: MetricsService,
                public breakpointObserver: BreakpointObserver,
                private chref: ChangeDetectorRef,
                public lpService: LandingpageService) 
    {
        this.reqId = this.route.snapshot.paramMap.get('id');
        this.inBrowser = isPlatformBrowser(platformId);
        this.editEnabled = cfg.get('editEnabled', false) as boolean;
        this.editMode = this.EDIT_MODES.VIEWONLY_MODE;
        this.delayTimeForMetricsRefresh = +this.cfg.get("delayTimeForMetricsRefresh", "300");

        this.lpService.watchCurrentSection((currentSection) => {
            this.goToSection(currentSection);
        });

        if (this.editEnabled) {
            this.edstatsvc.watchEditMode((editMode) => {
                this.editMode = editMode;
                if (this.editMode == this.EDIT_MODES.DONE_MODE ||
                    this.editMode == this.EDIT_MODES.OUTSIDE_MIDAS_MODE)
                {
                    this.displaySpecialMessage = true;
                    this._showContent = true;
                    this.setMessage();
                }
                
                this.hideToolMenu = (this.editMode == this.EDIT_MODES.EDIT_MODE);
            });

            this.mdupdsvc.subscribe(
                (md) => {
                    if (md && md != this.md) {
                        this.md = md as NerdmRes;
                    }

                    if(md && !this.helpContentUpdated){
                        this.updateHelpContent();
                    }

                    this.showData();
                }
            );

            this.edstatsvc.watchShowLPContent((showContent) => {
                this._showContent = showContent;
            });
        }
    }

    /**
     * initialize the component.  This is called early in the lifecycle of the component by 
     * the Angular rendering infrastructure.
     */
    ngOnInit() {
        this.recordLevelMetrics = new RecordLevelMetrics();
        var showError: boolean = true;
        let metadataError = "";
        this.displaySpecialMessage = false;
        this.CART_ACTIONS = CartActions.cartActions;
        this.imageURL = 'assets/images/fingerprint.jpg';

        // Only listen to storage change if we are not in edit mode
        if(this.inBrowser && !this.editEnabled){
            this.cartChangeHandler = this.cartChanged.bind(this);
            window.addEventListener("storage", this.cartChangeHandler);
        }
        this.metricsData = new MetricsData();

        // Clean up cart status storage 
        if(this.inBrowser){
            this.dataCartStatus = DataCartStatus.openCartStatus();
            this.dataCartStatus.cleanUpStatusStorage();
        }

        if (this.editEnabled) {
            this.route.queryParamMap.subscribe(queryParams => {
                let param = queryParams.get("editEnabled");
                if (param)
                    this.editRequested = (param.toLowerCase() == 'true');

                // if editEnabled = true, we don't want to display the data that came from mdserver
                // Will set the display to true after the authentication process. If authentication failed, 
                // we set it to true and the data loaded from mdserver will be displayed. If authentication 
                // passed and draft data loaded from customization service, we will set this flag to true 
                // to display the data from MIDAS.
                this.edstatsvc.setShowLPContent(! this.editRequested);
            });
        }

        // Retrive Nerdm record and keep it in case we need to display it in preview mode
        // use case: user manually open PDR landing page but the record was not edited by MIDAS
        // This part will only be executed if "editEnabled=true" is not in URL parameter.
        this.mdserv.getMetadata(this.reqId).subscribe(
        (data) => {
            // successful metadata request
            this.md = data;
            // this.midasRecord = data;

            if (!this.md) {
                // id not found; reroute
                console.error("No data found for ID=" + this.reqId);
                metadataError = "not-found";
            }
            else{
                this.theme = ThemesPrefs.getTheme((new NERDResource(this.md)).theme());

                if(this.inBrowser){
                    if(this.editEnabled){
                        this.metricsData.hasCurrentMetrics = false;
                        this.showMetrics = true;
                    }else{
                        if(this.theme == Themes.DEFAULT_THEME){
                            console.log("Getting metrics...");
                            this.getMetrics();
                        }
                            
                    }
                }

                // proceed with rendering of the component
                this.useMetadata();

                // if editing is enabled, and "editEnabled=true" is in URL parameter, try to start the page
                // in editing mode.  This is done in concert with the authentication process that can involve 
                // redirection to an authentication server; on successful authentication, the server can 
                // redirect the browser back to this landing page with editing turned on. 
                if (this.inBrowser) {
                    // Display content after 15sec no matter what
                    setTimeout(() => {
                        this.edstatsvc.setShowLPContent(true);
                    }, 15000);
        
                    if (this.editRequested) {
                        showError = false;
                        // console.log("Returning from authentication redirection (editmode="+
                        //             this.editRequested+")");
                        
                        // Need to pass reqID (resID) because the resID in editControlComponent
                        // has not been set yet and the startEditing function relies on it.
                        this.edstatsvc.startEditing(this.reqId);
                    }
                    else 
                        showError = true;
                }
            }

            if (showError) {
                if (metadataError == "not-found") {
                    if (this.editRequested) {
                        console.log("ID not found...");
                        this.edstatsvc._setEditMode(this.EDIT_MODES.OUTSIDE_MIDAS_MODE);
                        this.setMessage();
                        this.displaySpecialMessage = true;
                    }
                    else {
                        this.router.navigateByUrl("not-found/" + this.reqId, { skipLocationChange: true });
                    }
                }
            }
        },
        (err) => {
            console.error("Failed to retrieve metadata: ", err);
            this.edstatsvc.setShowLPContent(true);
            if (err instanceof IDNotFound) {
                metadataError = "not-found";
                this.router.navigateByUrl("not-found/" + this.reqId, { skipLocationChange: true });
            }
            else {
                metadataError = "int-error";
                // this.router.navigateByUrl("int-error/" + this.reqId, { skipLocationChange: true });
                this.router.navigateByUrl("int-error/" + this.reqId, { skipLocationChange: true });
            }
        });
    }

    /**
     * Update help content
     */
    updateHelpContent() {
        //Read meta from Midas record
        this.mdupdsvc.loadMetaData().subscribe( midasrec => {
            if(midasrec["resourceType"] != undefined) {
                this.wordMpping["resource"] = midasrec["resourceType"];
                this.resourceType = midasrec["resourceType"];

                //Broadcast resource type
                this.lpService.setResourceType(this.resourceType);

                //Update helpContentAll
                let keys = Object.keys(this.wordMpping);
                keys.forEach(key => {
                    this.helpContentAll = JSON.parse(JSON.stringify(this.helpContentAll).replace(new RegExp(key, 'g'), this.wordMpping[key]));
                })  
                
                //Only update help content once
                this.helpContentUpdated = true;
            }
        })
    }

    /**
     * Get metrics data
     */
     getMetrics() {
        let ediid = this.md.ediid;
        this.metricsService.getFileLevelMetrics(ediid).subscribe(async (event) => {
            // Some large dataset might take a while to download. Only handle the response
            // when download is completed
            if(event.type == HttpEventType.Response){
                let response = await event.body.text();

                this.fileLevelMetrics = JSON.parse(response);

                if(this.fileLevelMetrics.FilesMetrics != undefined && this.fileLevelMetrics.FilesMetrics.length > 0 && this.md.components){
                    // check if there is any current metrics data
                    for(let i = 1; i < this.md.components.length; i++){
                        let filepath = this.md.components[i].filepath;
                        if(filepath) filepath = filepath.trim();

                        this.metricsData.hasCurrentMetrics = this.fileLevelMetrics.FilesMetrics.find(x => x.filepath.substr(x.filepath.indexOf(ediid)+ediid.length+1).trim() == filepath) != undefined;
                        if(this.metricsData.hasCurrentMetrics) break;
                    }
                }else{
                    this.metricsData.hasCurrentMetrics = false;
                }

                if(this.metricsData.hasCurrentMetrics){
                    this.metricsService.getRecordLevelMetrics(ediid).subscribe(async (event) => {
                        if(event.type == HttpEventType.Response){
                            this.recordLevelMetrics = JSON.parse(await event.body.text());

                            let hasFile = false;
        
                            if(this.md.components && this.md.components.length > 0){
                                this.md.components.forEach(element => {
                                    if(element.filepath){
                                        hasFile = true;
                                        return;
                                    }
                                });
                            }
            
                            if(hasFile){
                                //Now check if there is any metrics data
                                this.metricsData.totalDatasetDownload = this.recordLevelMetrics.DataSetMetrics[0] != undefined? this.recordLevelMetrics.DataSetMetrics[0].record_download : 0;
                
                                this.metricsData.totalDownloadSize = this.recordLevelMetrics.DataSetMetrics[0] != undefined? this.recordLevelMetrics.DataSetMetrics[0].total_size : 0;
                    
                                this.metricsData.totalUsers = this.recordLevelMetrics.DataSetMetrics[0] != undefined? this.recordLevelMetrics.DataSetMetrics[0].number_users : 0;
                        
                                this.metricsData.totalUsers = this.metricsData.totalUsers == undefined? 0 : this.metricsData.totalUsers;                                    
                            }

                            this.metricsData.dataReady = true;
                        }
                    },
                    (err) => {
                        console.error("Failed to retrieve dataset metrics: ", err);
                        this.metricsData.hasCurrentMetrics = false;
                        this.showMetrics = true;
                        this.metricsData.dataReady = true;
                    });  
                }else{
                    this.metricsData.dataReady = true;
                }
                this.showMetrics = true;
            }
        },
        (err) => {
            console.error("Failed to retrieve file metrics: ", err);
            this.metricsData.hasCurrentMetrics = false;
            this.showMetrics = true;
            this.metricsData.dataReady = true; // ready to display message
        });                    
    }

    /**
     * Detect window scroll
     */
    @HostListener("window:scroll", [])
    onWindowScroll() {
        if(this.mobileMode)
            this.windowScrolled = (window.pageYOffset > this.btnPosition);
        else
            this.windowScrolled = (window.pageYOffset > this.menuPosition);

        this.sidebarY = this.sidebarStartY - window.pageYOffset;
        // this.sidebarY = this.sidebarY > 10 ? this.sidebarY : 10;
        this.sidebarY = this.sidebarY < -80 ? -80 : this.sidebarY;
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
            return formatBytes(this.recordLevelMetrics.DataSetMetrics[0].total_size, 2);
        else
            return "";
    }

    /**
     * apply housekeeping after view has been initialized
     */
    ngAfterViewInit() {
        if(this.inBrowser) {
            //Set the position of the sticky menu (or menu button)
            setTimeout(() => {
                this.setMenuPosition();
            }, 0);
        }

        if (this.md && this.inBrowser) {
            this.useFragment();

            window.history.replaceState({}, '', '/od/id/' + this.reqId);
        }
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
                    if (this.menuElement)
                        this.menuPosition = this.menuElement.nativeElement.offsetTop + 10;
                } else {
                    this.mobileMode = true;
                    if (this.btnElement)
                        this.btnPosition = this.btnElement.nativeElement.offsetTop + 10;
                }
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
        if (this.md != null)
            this._showData = true;
        else
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
        this.mdupdsvc.setOriginalMetadata(this.md);

        this.showData();
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
     * return text representing the recommended citation for this resource
     */
    getCitation(): string {
        this.citetext = (new NERDResource(this.md)).getCitation();
        return this.citetext;
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

        if(this.mobileMode){
            this.mainBodyStatus = "mainfullyexpanded";
        }else {
            if(this.sidebarVisible)
                this.mainBodyStatus = "mainsquished";
            else    
                this.mainBodyStatus = "mainexpanded";
        }
    }
}
