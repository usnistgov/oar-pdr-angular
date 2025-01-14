import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { Reference } from './reference';
import { RefMidasComponent } from './ref-midas/ref-midas.component';
import { CommonModule } from '@angular/common';
import { RefPubComponent } from './ref-pub/ref-pub.component';

@Component({
    selector: 'app-references',
    standalone: true,
    imports: [
        CommonModule,
        RefMidasComponent,
        NgbModule,
        RefPubComponent
    ],
    templateUrl: './references.component.html',
    styleUrls: ['../landing.component.scss', './references.component.css']
})
export class ReferencesComponent implements OnInit {
    fieldName: string = 'references';
    isPublicSite: boolean = false; 

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;
    @Input() isEditMode: boolean = true;

    constructor(public mdupdsvc : MetadataUpdateService,        
        private modalService: NgbModal,       
        private chref: ChangeDetectorRef,        
        private notificationService: NotificationService,
        public globalsvc: GlobalService,
        public lpService: LandingpageService) { 

    }

    ngOnInit(): void {
        this.isPublicSite = this.globalsvc.isPublicSite();
    }

    ngOnChanges(ch : SimpleChanges) {
        this.chref.detectChanges();
    }
}
