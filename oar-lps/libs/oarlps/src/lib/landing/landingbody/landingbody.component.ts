import { Component, Input, ViewChild, ElementRef, Output, EventEmitter, inject } from '@angular/core';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';
import { MetricsData } from "../metrics-data";
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { ResourceIdentityComponent } from '../sections/resourceidentity.component';
import { ResourceDataComponent } from '../sections/resourcedata.component';
import { ResourceDescriptionComponent } from '../sections/resourcedescription.component';
import { ResourceMetadataComponent } from '../sections/resourcemetadata.component';
import { ResourceRefsComponent } from '../sections/resourcerefs.component';
import { LandingpageService, HelpTopic } from '../landingpage.service';

/**
 * a component that presents the landing page's presentation of the resource description
 *
 * The description is organized into the following sections:
 *  * front matter, providing information that identifies the resource, namely its:
 *     - title
 *     - authors
 *     - contact
 *     - identifier
 *     - the paper this resource is a supplement to, if applicable
 *     - a link to official landing page (if different from this one)
 *  * Description, including
 *     - the abstract/description text
 *     - the subject keywords
 *     - the applicable research topics
 *  * Data Access, including, as applicable,
 *     - list of the downloadable files
 *     - links to data access pages
 *     - statements of access policies and rights
 *  * References
 *  * Metadata
 */
@Component({
    selector:    'landing-body',
    standalone: true,
    imports: [
      CommonModule,
      ResourceIdentityComponent,
      ResourceDataComponent,
      ResourceDescriptionComponent,
      ResourceMetadataComponent,
      ResourceRefsComponent
    ],
    templateUrl: './landingbody.component.html',
    styleUrls:   [
        '../landing.component.scss'
    ]
})
export class LandingBodyComponent {
    recordType: string = "";
    globalsvc = inject(GlobalService);

    // passed in by the parent component:
    @Input() md: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    @Input() editEnabled: boolean;

    // Pass out download status
    @Output() dlStatus: EventEmitter<string> = new EventEmitter();
    // Flag to tell if current screen size is mobile or small device
    @Input() mobileMode : boolean|null = false;

    @Input() metricsData: MetricsData;
    @Input() showJsonViewer: boolean = false;
    @Input() theme: string;
    @Input() isPublicSite: boolean;

    @ViewChild(ResourceMetadataComponent)
    resourceMetadataComponent: ResourceMetadataComponent;

    @ViewChild('description') description: ElementRef;
    @ViewChild('dataAccess') dataAccess: ElementRef;
    @ViewChild('references') references: ElementRef;
    @ViewChild('about') about: ElementRef;

    /**
     * create an instance of the Identity section
     */
    constructor(
        public edstatsvc: EditStatusService,
        public lpService: LandingpageService)
    { }

    ngOnInit(): void {
        this.recordType = (new NERDResource(this.md)).resourceLabel();
    }
    /**
     * scroll the view to the named section.  The available sections are: "top", "description",
     * "dataAccess", "references", and "metadata".  Any other value will be treated as "top".
     * (Note that the "references" section may be omitted if there are no references to be displayed.)
     */
    goToSection(sectionID) {
        if(!sectionID) sectionID = "top";

        switch(sectionID) {
            case SectionPrefs.getFieldName(Sections.DESCRIPTION): {
                this.description.nativeElement.scrollIntoView({behavior: 'smooth'});
               break;
            }
            case SectionPrefs.getFieldName(Sections.KEYWORDS): {
                this.description.nativeElement.scrollIntoView({behavior: 'smooth'});
               break;
            }
            case SectionPrefs.getFieldName(Sections.DATA_ACCESS): {
                this.dataAccess.nativeElement.scrollIntoView({behavior: 'smooth'});
               break;
            }
            case SectionPrefs.getFieldName(Sections.REFERENCES): {
                this.references.nativeElement.scrollIntoView({behavior: 'smooth'});
                break;
            }
            case SectionPrefs.getFieldName(Sections.ABOUT): {
                this.about.nativeElement.scrollIntoView({behavior: 'smooth'});
                break;
            }
            default: { // GO TOP
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                break;
            }
        }
    }

    /**
     * Emit the download status
     * @param downloadStatus - download status ('downloading' or 'downloaded')
     */
     setDownloadStatus(downloadStatus){
        this.dlStatus.emit(downloadStatus);
    }
}
