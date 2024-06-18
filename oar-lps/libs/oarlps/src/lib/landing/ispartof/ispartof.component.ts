import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { AppConfig } from '../../config/config';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { LandingConstants } from '../../landing/constants';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-ispartof',
  templateUrl: './ispartof.component.html',
  styleUrls: ['./ispartof.component.css', '../landing.component.scss'],
  animations: [
    trigger('editExpand', [
    state('collapsed', style({height: '0px', minHeight: '0'})),
    state('expanded', style({height: '*'})),
    transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
]
})
export class IspartofComponent implements OnInit {
    isPartOf: string[] = null;
    dataChanged: boolean = false;
    isEditing: boolean = false;
    fieldName = SectionPrefs.getFieldName(Sections.COLLECTION);
    editBlockStatus: string = 'collapsed';
    editMode: string = MODE.NORNAL; 
    overflowStyle: string = 'hidden';
    selectedCollection: string = "Forensics";
    originalCollection: string = null;

    collectionData = [
        {id: 1, displayName: "Additive Manufacturing", value: "AdditiveManufacturing"},
        {id: 2, displayName: "Chips Metrology (METIS)", value: "Metrology"},
        {id: 3, displayName: "Forensics", value: "Forensics"},
        {id: 4, displayName: "Do not add to any collection", value: "None"}
    ]

    @Input() record: any[];
    @Input() inBrowser: boolean; 

    constructor(
        private cfg: AppConfig,
                public editstatsvc: EditStatusService,
                public mdupdsvc : MetadataUpdateService, 
                private gaService: GoogleAnalyticsService,
                public lpService: LandingpageService
    ) { }

    ngOnInit(): void {
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
           
            this.isPartOf = [
                article,
                this.cfg.get("locations.landingPageService") + coll['@id'],
                title,
                suffix
            ];

            let collectionIndex = this.collectionData.findIndex(c => this.isPartOf[2].includes(c.displayName))

            if(collectionIndex >= 0) {
                this.selectedCollection = this.collectionData[collectionIndex].value;
                this.originalCollection = this.selectedCollection;
            }
        }
    }   
    
    startEditing() {
        this.setMode(MODE.EDIT);
    }

    closeEditBlock() {
        this.setMode(MODE.NORNAL, true);
    }

    restoreOriginal() {

    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); } 
 
    /**
     * Refresh the help text
     */
    refreshHelpText(){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];
        this.lpService.setSectionHelp(sectionHelp);
    }    

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            this.refreshHelpText();
        }
            
        switch ( this.editMode ) {
            case MODE.EDIT:
                this.isEditing = true;
                this.editBlockStatus = 'expanded';
                this.setOverflowStyle();
                break;
 
            default: // normal
                this.isEditing = false;
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.dataChanged = false;
                this.setOverflowStyle();
                this.dataChanged = false;
                break;
        }

        // this.getRecordBackgroundColor();
        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }    

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */    
    setOverflowStyle() {
        if(this.editBlockStatus == 'collapsed') {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }    

    saveCollection() {
        //Save collection then close edit block

        this.dataChanged = false;
        this.setMode(MODE.NORNAL, true);

    }

    undoCurCollectionChanges() {
        this.selectedCollection = this.originalCollection;
        this.dataChanged = false;
        this.setMode(MODE.NORNAL, true);
    }

    colChanged(event) {
        console.log("event", event.target.value);
        this.selectedCollection = event.target.value;
        this.dataChanged = true;
    }
}
