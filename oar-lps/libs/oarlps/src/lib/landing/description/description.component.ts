import { Component, OnInit, Input, SimpleChanges, inject } from '@angular/core';
import { SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { DescEditComponent } from './desc-edit/desc-edit.component';

@Component({
    selector: 'app-description',
    standalone: true,
    imports: [ 
        CommonModule, 
        DescEditComponent
    ],
    templateUrl: './description.component.html',
    styleUrls: ['../landing.component.scss', './description.component.css']
})
export class DescriptionComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() isEditMode: boolean = true;
    @Input() isPublicSite: boolean = true;  
    
    fieldName: string = SectionPrefs.getFieldName(Sections.DESCRIPTION);
    description: string = "";
    maxWidth: number = 1000;
    globalsvc = inject(GlobalService);
    
    constructor(){
        this.globalsvc.watchLpsLeftWidth(width => {
            this.onResize(width + 20);
        })
    }

    ngOnInit() {
        this.getDescription();
    }

    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.getDescription();
        }
    }

    onResize(width: number) {
        this.maxWidth = width;
    }

    /**
     * Update keywords and original keywords from the record
     */
    getDescription() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.description = this.record[this.fieldName].join("\r\n\r\n");
        else
            this.description = "";
    }
}
