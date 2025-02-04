import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NERDResource } from '../../nerdm/nerdm';
import { MODE, Sections, SectionPrefs, GlobalService } from '../../shared/globals/globals';
import { IspartofEditComponent } from './ispartof-edit/ispartof-edit.component';
import { IspartofPubComponent } from './ispartof-pub/ispartof-pub.component';

@Component({
  selector: 'app-ispartof',
  standalone: true,
  imports: [
    IspartofEditComponent,
    IspartofPubComponent
  ],
  templateUrl: './ispartof.component.html',
  styleUrls: ['./ispartof.component.css', '../landing.component.scss']
})
export class IspartofComponent implements OnInit {
    isPartOf: string[] = null;
    selectedCollection: string = "Forensics";
    originalCollection: string = null;

    isPublicSite: boolean = false; 

    // collectionData = [
    //     {id: 1, displayName: "Additive Manufacturing", value: "AdditiveManufacturing"},
    //     {id: 2, displayName: "Chips Metrology (METIS)", value: "Metrology"},
    //     {id: 3, displayName: "Forensics", value: "Forensics"},
    //     {id: 4, displayName: "Do not add to any collection", value: "None"}
    // ]

    @Input() record: any[];
    @Input() inBrowser: boolean; 
    @Input() isEditMode: boolean;
    @Input() landingPageServiceStr: string;

    constructor(public globalsvc: GlobalService) { 
        this.isPublicSite = this.globalsvc.isPublicSite();
    }

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
                // this.cfg.get("locations.landingPageService") + coll['@id'],
                this.landingPageServiceStr + coll['@id'],
                title,
                suffix
            ];

            // let collectionIndex = this.collectionData.findIndex(c => this.isPartOf[2].includes(c.displayName))

            // if(collectionIndex >= 0) {
            //     this.selectedCollection = this.collectionData[collectionIndex].value;
            //     this.originalCollection = this.selectedCollection;
            // }
        }
    }   
}
