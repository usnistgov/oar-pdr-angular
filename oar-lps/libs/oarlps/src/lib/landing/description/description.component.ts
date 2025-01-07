import { Component, OnInit, Input, Output, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, GlobalService } from '../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
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
    
    fieldName: string = SectionPrefs.getFieldName(Sections.DESCRIPTION);
    description: string = "";
    maxWidth: number = 1000;
    isPublicSite: boolean = false; 
    
    constructor(
                public globalsvc: GlobalService){
                    
                this.globalsvc.watchLpsLeftWidth(width => {
                    this.onResize(width + 20);
                })
    }

    ngOnInit() {
        this.isPublicSite = this.globalsvc.isPublicSite();
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
