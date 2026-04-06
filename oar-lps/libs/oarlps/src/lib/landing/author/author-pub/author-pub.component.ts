import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Author } from '../author';
import { CommonModule } from '@angular/common';
import { CollapseModule } from '../../collapseDirective/collapse.module';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faCaretDown,
    faCaretRight
} from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../../../shared/globals/globals';

@Component({
    selector: 'author-pub',
    standalone: true,
    imports: [
        CommonModule,
        CollapseModule,
        NgbModule,
        FontAwesomeModule
    ],
    templateUrl: './author-pub.component.html',
    styleUrls: ['./author-pub.component.scss', '../../landing.component.scss']
})
export class AuthorPubComponent {
    authors: Author[] = [];
    overflowStyle: string = 'hidden';

    //icon class names
    caretRightIcon = iconClass.CARET_RIGHT;
    caretDownIcon = iconClass.CARET_DOWN;

    @Input() record: any[];
    @Input() fieldName: string;
    @Input() isScienceTheme: boolean = false;

    constructor(public iconLibrary: FaIconLibrary,) { 

        iconLibrary.addIcons(
            faCaretDown,
            faCaretRight
        );  
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
