import { Component, OnChanges, SimpleChanges, Input, ViewChild, effect, ChangeDetectorRef } from '@angular/core';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { VersionComponent } from '../version/version.component';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { LandingConstants } from '../../shared/globals/globals';
import { Themes, AppSettings, SectionHelp, SectionPrefs, Sections, MODE } from '../../shared/globals/globals';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { Collections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TitleComponent } from '../title/title.component';
import { IspartofComponent } from '../ispartof/ispartof.component';
import { FacilitatorsComponent } from '../facilitators-to be removed/facilitators.component';
import { FacilitatorsPubComponent } from '../facilitators-to be removed/facilitators-pub/facilitators-pub.component';
import { FacilitatorsMidasComponent } from '../facilitators-to be removed/facilitators-midas/facilitators-midas.component';
import { AuthorPubComponent } from '../author/author-pub/author-pub.component';
import { AuthorMidasComponent } from '../author/author-midas/author-midas.component';
import { ContactPubComponent } from '../contact/contact-pub/contact-pub.component';
import { ContactMidasComponent } from '../contact/contact-midas/contact-midas.component';
import { VisithomePubComponent } from '../visithome/visithome-pub/visithome-pub.component';
import { VisithomeMidasComponent } from '../visithome/visithome-midas/visithome-midas.component';

/**
 * a component that lays out the "identity" section of a landing page
 */
@Component({
    selector:      'pdr-resource-id',
    standalone: true,
    imports: [
        CommonModule,
        TitleComponent,
        IspartofComponent,
        FacilitatorsComponent,
        ContactPubComponent,
        ContactMidasComponent,
        VersionComponent,
        VisithomePubComponent,
        VisithomeMidasComponent,
        FacilitatorsPubComponent,
        FacilitatorsMidasComponent,
        AuthorPubComponent,
        AuthorMidasComponent,
        NgbModule
    ],
    templateUrl:   './resourceidentity.component.html',
    styleUrls:   [
        './resourceidentity.component.css', '../landing.component.scss'
    ]
})
export class ResourceIdentityComponent implements OnChanges {

    recordType: string = "";
    doiUrl: string = null;
    doiLabel: string = "";
    showHomePageLink: boolean = true;
    primaryRefs: any[] = [];
    editMode: string;
    EDIT_MODES: any;
    // isPartOf: string[] = null;
    scienceTheme = Themes.SCIENCE_THEME;
    defaultTheme = Themes.DEFAULT_THEME;
    fileManagerUrl = AppSettings.HOMEPAGE_DEFAULT_URL;
    fieldName = SectionPrefs.getFieldName(Sections.DOI);
    collection: string = Collections.DEFAULT;
    maxWidth: number = 1000;
    isEditMode: boolean = true;

    authorFieldName = SectionPrefs.getFieldName(Sections.AUTHORS);
    facilitatorsFieldName = SectionPrefs.getFieldName(Sections.FACILITATORS);

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    @Input() theme: string;
    @Input() isPublicSite: boolean = true;
    @Input() landingPageURL: string;
    @Input() landingPageServiceStr: string;

    /**
     * create an instance of the Identity section
     */
    constructor(public editstatsvc: EditStatusService,
                public globalService: GlobalService,
                public lpService: LandingpageService)
    { 
        this.globalService.watchCollection((collection) => {
            this.collection = collection;
        });

        this.globalService.watchLpsLeftWidth(width => {
            this.onResize(width + 20);
        })

        effect(() => {
            this.isEditMode = this.editstatsvc.isEditMode();
            // this.chref.detectChanges();
        })
    }

    ngOnInit(): void {
        let i = this.isDefaultCollection;

        this.EDIT_MODES = LandingConstants.editModes;

        // Watch current edit mode set by edit controls
        this.editstatsvc.watchEditMode((editMode) => {
            this.editMode = editMode;
        });

        // this.landingPageURL = this.cfg.get('landingPageService','/od/id/') + this.record['@id'];
    }

    onResize(width: number) {
        this.maxWidth = width;
    }

    get isScienceTheme() {
        return this.theme == this.scienceTheme;
    }
    /**
     * Decide if currently in view only mode
     */
    get inViewMode() {
        return this.editMode == this.EDIT_MODES.VIEWONLY_MODE || this.editMode == this.EDIT_MODES.PREVIEW_MODE;
    }

    get isDefaultCollection() {
        return this.collection == Collections.DEFAULT;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.recordLoaded())
            this.useMetadata();  // initialize internal component data based on metadata
    }

    recordLoaded() {
        return this.record && !(Object.keys(this.record).length === 0);
    }

    /**
     * initial this component's internal data used to drive the display based on the 
     * input resource metadata
     */
    useMetadata(): void {
        this.showHomePageLink = this.isExternalHomePage(this.record['landingPage']);

        this.recordType = (new NERDResource(this.record)).resourceLabel();

        if (this.record['isPartOf'] && Array.isArray(this.record['isPartOf']) && 
            this.record['isPartOf'].length > 0 && this.record['isPartOf'][0]['@id'])
        {
            // this resource is part of a collection; format a label indicating that
            let coll = this.record['isPartOf'][0];
            
            let article = "";
            let title = "another collection";
            let suffix = "";
            if (coll['title']) {
                article = "the";
                title = coll['title']
                suffix = "Collection";
                if (NERDResource.objectMatchesTypes(coll, "ScienceTheme"))
                    suffix = "Science Theme";
            }
           
            // this.isPartOf = [
            //     article,
            //     this.cfg.get("links.pdrIDResolver") + coll['@id'],
            //     title,
            //     suffix
            // ];
        }

        if (this.record['doi'] !== undefined && this.record['doi'] !== ""){
            this.doiUrl = "https://doi.org/" + this.record['doi'].substring(4);
            this.doiLabel = this.doiUrl;
        }else if(this.record['landingPage']){
            this.doiUrl = this.record['landingPage'];
            this.doiLabel = this.record['@id'];
        }
        else{
            this.doiUrl = this.landingPageURL + this.record["@id"];
            this.doiLabel = this.record["@id"];
        }

        this.primaryRefs = (new NERDResource(this.record)).getPrimaryReferences();
        for (let ref of this.primaryRefs) {
            if (! ref['label'])
                ref['label'] = ref['title'] || ref['citation'] || ref['location']
        }
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
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    // googleAnalytics(url: string, event, title) {
    //     this.gaService.gaTrackEvent('homepage', event, title, url);
    // }

    visitHomePageBtnStyle() {
        if(this.theme == this.scienceTheme) {
            return "var(--science-theme-background-default)";
        }else{
            return "var(--nist-green-default)"
        }

    }


    /**
     * Refresh the help text
     */
    refreshHelpText(){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[MODE.EDIT];   //Use edit mode in order to display help text

        this.lpService.setSectionHelp(sectionHelp);
    }
    
    /*
     * uncomment this as needed for debugging purposes
     *
    @ViewChild(VersionComponent)
    versionCmp : VersionComponent;
     */

}
