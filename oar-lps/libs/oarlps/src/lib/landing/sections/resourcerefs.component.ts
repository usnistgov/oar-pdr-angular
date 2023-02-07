import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';

import { AppConfig } from '../../config/config';
import { NerdmRes, NERDResource } from '../../nerdm/nerdm';

/**
 * a component that lays out the "references" section of a landing page.
 * 
 */
@Component({
    selector:      'pdr-resource-refs',
    templateUrl:   './resourcerefs.component.html',
    styleUrls:   [
        '../landing.component.scss',
        './resourcerefs.component.css'
    ]
})
export class ResourceRefsComponent {

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    /**
     * create an instance of the Identity section
     */
    constructor(private cfg: AppConfig)
    { }
}


    
