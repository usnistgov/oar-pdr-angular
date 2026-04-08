import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewResponse, Suggestion, iconClass } from '../../shared/globals/globals';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faCaretDown,
    faCaretRight
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'suggestion-details',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './suggestion-details.component.html',
    styleUrls: ['./suggestion-details.component.css', '../sidebar.component.css', '../../landing/landing.component.scss']
})
export class SuggestionDetailsComponent {
    showDetails: boolean = false;
    fieldName: string = "sidebar";
    isMouseOver: boolean = false;

    //icon class names
    caretRightIcon = iconClass.CARET_RIGHT;
    caretDownIcon = iconClass.CARET_DOWN;


    @Input() suggestion: Suggestion;
    @Input() textOnly: boolean = false;
    @Output() gotoSectionName = new EventEmitter<string>();

    constructor(
        private chref: ChangeDetectorRef,
        public iconLibrary: FaIconLibrary) { 
        
        iconLibrary.addIcons(
            faCaretDown,
            faCaretRight
        );  
    }

    get hasDetails() {
        return this.suggestion && this.suggestion.details && this.suggestion.details.length > 0;
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.suggestion)
            this.chref.detectChanges();
    }
    
    toogleDetails(event: Event=null) {
        if(event) event.stopPropagation();
        this.showDetails = !this.showDetails;
        this.chref.detectChanges();
    }

    gotoSection(section) {
        if(this.textOnly) return;
        
        this.toogleDetails();
        this.gotoSectionName.emit(section);
        this.chref.detectChanges();
    }

    linkedTextStyleClass() {
        if(this.textOnly)
            return "";
        else
            return "link-text";
    }
}
