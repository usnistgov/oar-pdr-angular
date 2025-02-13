import { Component, OnChanges, Input, ViewChild, ElementRef, effect } from '@angular/core';
import { AppConfig } from '../../config/config';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { animate, style, transition, trigger } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { ColorScheme } from '../../shared/globals/globals';
import { GlobalService } from '../../shared/globals/globals'
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionComponent } from '../description/description.component';
import { TopicComponent } from '../topic/topic.component';
import { KeywordComponent } from '../keyword/keyword.component';
import { TopicPubComponent } from '../topic/topic-pub/topic-pub.component';
import { KeywordPubComponent } from '../keyword/keyword-pub/keyword-pub.component';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { SectionTitleComponent } from '../section-title/section-title.component';

/**
 * a component that lays out the "Description" section of a landing page which includes the prose 
 * description, subject keywords, and research topics.
 */
@Component({
    selector:      'pdr-resource-desc',
    standalone: true,
    imports: [
        SectionTitleComponent,
        CommonModule,
        DescriptionComponent,
        TopicComponent,
        KeywordComponent,
        TopicPubComponent,
        KeywordPubComponent,
        NgbModule
    ],    
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
    colorScheme: ColorScheme;
    maxWidth: number = 1000;
    isPublicSite: boolean = false; 
    isEditMode: boolean = true;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    
    /**
     * create an instance of the Identity section
     */
    constructor(public globalService: GlobalService,
                public edstatsvc: EditStatusService ) 
    {
        this.globalService.watchLpsLeftWidth(width => {
            this.maxWidth = width + 20;
        })

        effect(() => {
            this.isEditMode = this.edstatsvc.isEditMode();
        })
    }

    ngOnInit(): void {
        this.isPublicSite = this.globalService.isPublicSite();
        this.recordType = (new NERDResource(this.record)).resourceLabel();

        this.colorScheme = {
            "default": "#257a2d",
            "light": "#6bad73",
            "lighter": "#f0f7f1",
            "dark": "#1c6022",
            "hover": "#ffffff" 
        }
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


    
