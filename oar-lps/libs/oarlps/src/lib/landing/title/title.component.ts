import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, effect, ChangeDetectorRef } from '@angular/core';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleEditComponent } from './title-edit/title-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';

@Component({
    selector: 'app-title',
    standalone: true,
    imports: [ 
        CommonModule, 
        FormsModule, 
        TitleEditComponent,
        NgbModule 
    ],
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css', '../landing.component.scss']
})
export class TitleComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    fieldName: string = SectionPrefs.getFieldName(Sections.TITLE);
    isPublicSite: boolean = false; 

    constructor(
        public edstatsvc: EditStatusService,
        public mdupdsvc: MetadataUpdateService,
        private chref: ChangeDetectorRef,
        public globalsvc: GlobalService ) {

        effect(() => {
            const term = this.edstatsvc.isEditMode();
            this.chref.detectChanges();
        });
    }

    ngOnInit() {
        this.isPublicSite = this.globalsvc.isPublicSite();
    }
}
