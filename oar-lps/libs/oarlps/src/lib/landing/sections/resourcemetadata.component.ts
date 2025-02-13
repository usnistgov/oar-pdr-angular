import { Component, OnChanges, SimpleChanges, Input, ViewChild } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { MetricsData } from "../metrics-data";
import { ThemesPrefs } from '../../shared/globals/globals';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { AboutdatasetComponent } from '../aboutdataset/aboutdataset.component';

/**
 * a component that lays out the "About This Dataset" section of a landing page
 *
 * Currently, this section only provides access to the native NERDm metadata; in the future,
 * this section will provide access to other formats as well.
 */
@Component({
    selector:    'pdr-resource-md',
    standalone: true,
    imports: [
        SectionTitleComponent, 
        AboutdatasetComponent,
        NgbModule
    ],
    templateUrl: './resourcemetadata.component.html',
    styleUrls:  [
        '../landing.component.scss'
    ]
})
export class ResourceMetadataComponent implements OnChanges {
    resourceType: string;
    sectionTitle: string;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    // Flag to tell if current screen size is mobile or small device
    @Input() mobileMode : boolean|null = false;

    @Input() metricsData: MetricsData;
    @Input() showJsonViewer: boolean = false;
    @Input() theme: string;

    @ViewChild(AboutdatasetComponent, { static: true })
    aboutdatasetComponent: AboutdatasetComponent;

    /**
     * create an instance of the Identity section
     */
    constructor()
    { }

    ngOnChanges(ch: SimpleChanges) {
        // this.aboutdatasetComponent.collapsed = !this.showNerdm;
        if (this.record)
            this.useMetadata();  // initialize internal component data based on metadata
    }

    /**
     * initial this component's internal data used to drive the display based on the 
     * input resource metadata
     */
    useMetadata(): void {
        this.resourceType = ThemesPrefs.getResourceLabel(this.theme);
        this.sectionTitle = "About This " + this.resourceType;
    }
}
