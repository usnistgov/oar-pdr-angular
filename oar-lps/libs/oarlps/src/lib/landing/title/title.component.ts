import { Component, OnInit, Input, effect, ChangeDetectorRef } from '@angular/core';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TitlePubComponent } from './title-pub/title-pub.component';
import { TitleEditComponent } from './title-edit/title-edit.component';

@Component({
    selector: 'app-title',
    standalone: true,
    imports: [ 
        CommonModule, 
        FormsModule, 
        TitleEditComponent,
        TitlePubComponent,
        NgbModule 
    ],
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css', '../landing.component.scss']
})
export class TitleComponent implements OnInit {
    @Input() record: any[];
    @Input() isPublicSite: boolean;   // false if running server-side

    fieldName: string = SectionPrefs.getFieldName(Sections.TITLE);

    constructor(public edstatsvc: EditStatusService,
                private chref: ChangeDetectorRef,
                public globalsvc: GlobalService ) 
    {
        effect(() => {
            const term = this.edstatsvc.isEditMode();
            this.chref.detectChanges();
        });
    }

    ngOnInit() {
        this.isPublicSite = this.globalsvc.isPublicSite();
    }
}
