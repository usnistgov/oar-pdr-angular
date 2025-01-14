import { Component, OnInit, Input, ElementRef, EventEmitter, SimpleChanges, ViewChild, ChangeDetectorRef, effect } from '@angular/core';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { Author } from '../author';
import { CommonModule } from '@angular/common';
import { CollapseModule } from '../../collapseDirective/collapse.module';

@Component({
    selector: 'author-pub',
    standalone: true,
    imports: [
        CommonModule,
        CollapseModule,
        NgbModule
    ],
    templateUrl: './author-pub.component.html',
    styleUrls: ['./author-pub.component.scss', '../../landing.component.scss']
})
export class AuthorPubComponent {
    fieldName = SectionPrefs.getFieldName(Sections.AUTHORS);
    authors: Author[] = [];
    overflowStyle: string = 'hidden';

    @Input() record: any[];

    constructor() { 

    }

    ngOnInit() {
        this.getAuthors();
    }
    
    /**
     * If record changed, update originalRecord to keep track on previous saved record
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.getAuthors();
        }
    }

    /**
     * Update authors and original authors from the record
     */
    getAuthors() {
        if(this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0)
            this.authors = JSON.parse(JSON.stringify(this.record[this.fieldName]));
    }

    getSubunites(subunites)
    {
        if(subunites instanceof Array)
        {
            return subunites.join(', ');
        }else{
            return subunites;
        }
    }

    /**
     * Expand author details for non-edit mode
     */
    clicked = false;
    expandClick() {
        this.clicked = !this.clicked;
        return this.clicked;
    }
}
