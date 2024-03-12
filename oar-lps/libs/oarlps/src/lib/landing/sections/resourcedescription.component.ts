import { Component, OnChanges, Input, ViewChild } from '@angular/core';
import { AppConfig } from '../../config/config';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import * as globals from '../../shared/globals/globals'
import { animate, style, transition, trigger } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';

/**
 * a component that lays out the "Description" section of a landing page which includes the prose 
 * description, subject keywords, and research topics.
 */
@Component({
    selector:      'pdr-resource-desc',
    templateUrl:   './resourcedescription.component.html',
    styleUrls:   [
        '../landing.component.scss'
    ],
    animations: [
        trigger(
          'enterAnimation', [
            transition(':enter', [
              style({height: '0px', opacity: 0}),
              animate('700ms', style({height: '100%', opacity: 1}))
            ]),
            transition(':leave', [
              style({height: '100%', opacity: 1}),
              animate('700ms', style({height: 0, opacity: 0}))
            ])
          ]
        )
    ]
})
export class ResourceDescriptionComponent implements OnChanges {
    desctitle : string = "Description";
    recordType: string = "";
    titleSelected: boolean = false;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    /**
     * create an instance of the Identity section
     */
    constructor(private cfg: AppConfig, public lpService: LandingpageService, ) {
        // this.lpService.watchCurrentSection((currentSection) => {
        //     if(currentSection == globals.SectionPrefs.getFieldName(globals.Sections.DESCRIPTION)) {
        //         this.titleSelected = true;
        //         setTimeout(() => {
        //             this.titleSelected = false;
        //         }, 2000);
        //     }
        // });
    }

    ngOnInit(): void {
        this.recordType = (new NERDResource(this.record)).resourceLabel();
    }

    ngOnChanges() {
        if (this.record)
            this.useMetadata();  // initialize internal component data based on metadata
    }

    /**
     * initial this component's internal data used to drive the display based on the 
     * input resource metadata
     */
    useMetadata(): void {
        this.desctitle = (this.isDataPublication()) ? "Abstract" : "Description";
    }

    /**
     * return true if the resource is considered a data publication--i.e. it includes the type
     * "DataPublication"
     */
    isDataPublication() : boolean {
        return NERDResource.objectMatchesTypes(this.record, "DataPublication");
    }
}


    
