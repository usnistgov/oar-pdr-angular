import { Component, Input, effect } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { RefMidasComponent } from '../references/ref-midas/ref-midas.component';
import { RefPubComponent } from '../references/ref-pub/ref-pub.component';

/**
 * a component that lays out the "references" section of a landing page.
 * 
 */
@Component({
    selector:      'pdr-resource-refs',
    standalone: true,
    imports: [
        SectionTitleComponent,
        CommonModule,
        RefPubComponent,
        RefMidasComponent,
        NgbModule
    ],
    templateUrl:   './resourcerefs.component.html',
    styleUrls:   [
        '../landing.component.scss',
        './resourcerefs.component.css'
    ]
})
export class ResourceRefsComponent {
    sectionTitle: string = "References";
    isEditMode: boolean = true;
    
    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    @Input() isPublicSite: boolean = true;

    /**
     * create an instance of the Identity section
     */
    constructor(public edstatsvc: EditStatusService)
    { 
        effect(() => {
            this.isEditMode = this.edstatsvc.isEditMode();
        })
    }

    /**
     * Function to Check whether given record has references that need to be displayed
     */
    hasDisplayableReferences() {
        if (this.record['references'] && this.record['references'].length > 0) 
            return true;
        return false;
    }
}


    
