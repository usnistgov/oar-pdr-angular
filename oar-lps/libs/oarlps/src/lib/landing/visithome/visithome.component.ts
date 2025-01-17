import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, effect, ChangeDetectorRef } from '@angular/core';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { Themes, ThemesPrefs, AppSettings } from '../../shared/globals/globals';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../shared/globals/globals';
import { VisithomeEditComponent } from './visithome-edit/visithome-edit.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { VisithpmePubComponent } from './visithpme-pub/visithpme-pub.component';
import { VisithpmeMidasComponent } from './visithpme-midas/visithpme-midas.component';

@Component({
    selector: 'app-visithome',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        VisithpmePubComponent,
        VisithpmeMidasComponent,
        NgbModule
    ],
    templateUrl: './visithome.component.html',
    styleUrls: ['./visithome.component.css', '../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class VisithomeComponent implements OnInit {
    isPublicSite: boolean = false; 

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;
    @Input() theme: string;
    @Input() isEditMode: boolean;

    fieldName = SectionPrefs.getFieldName(Sections.VISIT_HOME_PAGE);
    scienceTheme = Themes.SCIENCE_THEME;

    constructor(public globalsvc: GlobalService) {     }

    ngOnInit(): void {
        this.isPublicSite = this.globalsvc.isPublicSite();
        console.log('this.isPublicSite', this.isPublicSite);
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

}
