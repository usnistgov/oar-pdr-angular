import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ContactService } from './contact.service';
import { Contact } from './contact';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { CommonModule } from '@angular/common';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../shared/globals/globals';
import { PeopleComponent } from '../people/people.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { ContactPubComponent } from './contact-pub/contact-pub.component';
import { ContactMidasComponent } from './contact-midas/contact-midas.component';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [ 
        CommonModule, 
        CollapseModule, 
        ContactMidasComponent, 
        ContactPubComponent,
        PeopleComponent, 
        NgbModule 
    ],
    providers: [ ContactService ],
    templateUrl: './contact.component.html',
    styleUrls: ['../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class ContactComponent implements OnInit {
    @Input() record: any[];
    @Input() isPublicSite: boolean;  
    
    constructor()
    {    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }
}
