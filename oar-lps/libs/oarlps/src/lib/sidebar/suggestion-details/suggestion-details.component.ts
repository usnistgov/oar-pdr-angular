import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewResponse, Suggestion } from '../../shared/globals/globals';

@Component({
    selector: 'suggestion-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './suggestion-details.component.html',
    styleUrls: ['./suggestion-details.component.css', '../sidebar.component.css', '../../landing/landing.component.scss']
})
export class SuggestionDetailsComponent {
    showDetails: boolean = false;
    fieldName: string = "sidebar";
    isMouseOver: boolean = false;

    @Input() suggestion: Suggestion;
    @Input() textOnly: boolean = false;
    @Output() gotoSectionName = new EventEmitter<string>();

    constructor(private chref: ChangeDetectorRef) { }

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
