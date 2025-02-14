import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { KeywordPubComponent } from './keyword-pub/keyword-pub.component';
import { KeywordMidasComponent } from './keyword-midas/keyword-midas.component';

@Component({
    selector: 'app-keyword',
    standalone: true,
    imports: [ 
        KeywordPubComponent,
        KeywordMidasComponent
    ],
    templateUrl: './keyword.component.html',
    styleUrls: ['./keyword.component.css', '../landing.component.scss']
})
export class KeywordComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() isEditMode: boolean = true;

    fieldName: string = SectionPrefs.getFieldName(Sections.KEYWORDS);
    isPublicSite: boolean = false; 
    globalsvc = inject(GlobalService);
    
    constructor(private chref: ChangeDetectorRef){ 

    }

    ngOnInit() {
        this.isPublicSite = this.globalsvc.isPublicSite();
    }

    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.chref.detectChanges();
    }


}
