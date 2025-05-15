import { Component, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NerdmRes } from '../../../nerdm/nerdm';
import { Reference } from '../reference';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ref-pub',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './ref-pub.component.html',
  styleUrls: ['../../landing.component.scss', './ref-pub.component.scss']
})
export class RefPubComponent {
    fieldName: string = 'references';
    overflowStyle: string = 'hidden';
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;

    // passed in by the parent component:
    @Input() record: NerdmRes = null;

    constructor(      
        private chref: ChangeDetectorRef) { 
    }

    ngOnInit(): void {
    }

    ngOnChanges(ch : SimpleChanges) {
        this.chref.detectChanges();
    }

    /**
     * Get the section style based on different modes
     * @returns div style
     */
    getStyle(){
        return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
    }

    /**
     * Function to Check whether given record has references that need to be displayed
     */
    hasDisplayableReferences() {
        if (this.record && this.record['references'] && this.record['references'].length > 0) 
            return true;
        return false;
    }

    /**
     * Return the link text of the given reference.  The text returned will be one of
     * the following, in order or preference:
     * 1. the value of the citation property (if set and is not empty)
     * 2. the value of the label property (if set and is not empty)
     * 3. to "URL: " appended by the value of the location property.
     * @param ref   the NERDm reference object
     */
    getReferenceText(ref){
        if(ref['citation'] && ref['citation'].trim() != "") 
            return ref['citation'];
        if(ref['label'] && ref['label'].trim() != "")
            return ref['label'];
        if(ref['location'] && ref['location'].trim() != "")
            return ref['location'];
        return " ";
    }      
}
