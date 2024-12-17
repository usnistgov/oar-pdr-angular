import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionPopupComponent } from '../description/description-popup/description-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, SubmitResponse } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleEditComponent } from './title-edit/title-edit.component';

@Component({
    selector: 'app-title',
    standalone: true,
    imports: [ CommonModule, FormsModule, TitleEditComponent ],
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css', '../landing.component.scss']
})
export class TitleComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    @ViewChild('title') titleElement: ElementRef;

    fieldName: string = SectionPrefs.getFieldName(Sections.TITLE);
    isPublicSite: boolean = false; //This is a placeholder. Will be decided by config

    constructor(public mdupdsvc: MetadataUpdateService,
        public lpService: LandingpageService, ) {
    }

    ngOnInit() {
    }
}
