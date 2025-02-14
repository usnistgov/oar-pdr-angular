import { Component, Input, effect } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { CommonModule } from '@angular/common';
import { ReferencesComponent } from '../references/references.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditStatusService } from '../editcontrol/editstatus.service';

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
        ReferencesComponent,
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

    /**
     * create an instance of the Identity section
     */
    constructor(public edstatsvc: EditStatusService)
    { 
        effect(() => {
            this.isEditMode = this.edstatsvc.isEditMode();
        })
    }
}


    
