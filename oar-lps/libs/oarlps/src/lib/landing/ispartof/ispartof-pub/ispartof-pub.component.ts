import { Component, Input, SimpleChanges } from '@angular/core';
import { NERDResource } from '../../../nerdm/nerdm';

@Component({
  selector: 'ispartof-pub',
  standalone: true,
  imports: [],
  templateUrl: './ispartof-pub.component.html',
  styleUrls: ['./ispartof-pub.component.scss', '../../landing.component.scss']
})
export class IspartofPubComponent {
    isPartOf: string[] = null;

    @Input() record: any[];
    @Input() landingPageServiceStr: string;
    
    ngOnInit() {
        this.getIsPartOf();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.getIsPartOf();
    }

    getIsPartOf() {
        if (this.record && this.record['isPartOf'] && Array.isArray(this.record['isPartOf']) && 
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
                this.landingPageServiceStr + coll['@id'],
                title,
                suffix
            ];
        }
    }
}
