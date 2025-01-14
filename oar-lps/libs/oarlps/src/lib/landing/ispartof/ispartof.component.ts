import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { AppConfig } from '../../config/config';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { LandingConstants } from '../../landing/constants';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../shared/globals/globals';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IspartofEditComponent } from './ispartof-edit/ispartof-edit.component';
import { IspartofPubComponent } from './ispartof-pub/ispartof-pub.component';

@Component({
  selector: 'app-ispartof',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    IspartofEditComponent,
    IspartofPubComponent
  ],
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
    editMode: string = MODE.NORMAL; 
    overflowStyle: string = 'hidden';
    selectedCollection: string = "Forensics";
    originalCollection: string = null;

    isPublicSite: boolean = false; 

    collectionData = [
        {id: 1, displayName: "Additive Manufacturing", value: "AdditiveManufacturing"},
        {id: 2, displayName: "Chips Metrology (METIS)", value: "Metrology"},
        {id: 3, displayName: "Forensics", value: "Forensics"},
        {id: 4, displayName: "Do not add to any collection", value: "None"}
    ]

    @Input() record: any[];
    @Input() inBrowser: boolean; 
    @Input() isEditMode: boolean;

    constructor(
        private cfg: AppConfig,
                public mdupdsvc : MetadataUpdateService, 
                private gaService: GoogleAnalyticsService,
                public globalsvc: GlobalService,
                private chref: ChangeDetectorRef,
                public lpService: LandingpageService
    ) { }

    ngOnInit(): void {
        this.isPublicSite = this.globalsvc.isPublicSite();
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
    
    restoreOriginal() {

    }
}
