import { Component, OnInit, Input, ElementRef, EventEmitter, SimpleChanges, ViewChild, effect, ChangeDetectorRef, inject } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { TextEditModule } from '../../text-edit/text-edit.module';
import { TextareaAutoresizeModule } from '../../textarea-autoresize/textarea-autoresize.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from "primeng/chip";
import { TagModule } from 'primeng/tag';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { LandingConstants } from '../constants';
import { KeywordPubComponent } from './keyword-pub/keyword-pub.component';
import { KeywordMidasComponent } from './keyword-midas/keyword-midas.component';

@Component({
    selector: 'app-keyword',
    standalone: true,
    imports: [ 
        CommonModule,
        FormsModule,
        ToolbarModule,
        TextEditModule,
        TextareaAutoresizeModule,
        NgbModule,
        ChipsModule,
        ChipModule,
        TagModule,
        ToastrModule,
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
