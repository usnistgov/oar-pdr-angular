import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReviewResponse, Suggestion } from '../../shared/globals/globals';
import { SuggestionDetailsComponent } from '../suggestion-details/suggestion-details.component';
import { state, style, trigger, transition, animate } from '@angular/animations';

@Component({
    selector: 'suggestions',
    standalone: true,
    imports: [CommonModule, SuggestionDetailsComponent],
    templateUrl: './suggestions.component.html',
    styleUrls: ['./suggestions.component.css', '../sidebar.component.css', '../../landing/landing.component.scss'],
    animations: [
        trigger("togglesbar", [
            state('sbvisible', style({
                position: 'absolute',
                right: '0%',
                top: "20px",
                bottom: "100%",
                overflow: "auto"
            })),
            state('sbhidden', style({
                position: 'absolute',
                right: '-450%',
                top: "20px",
                bottom: "100%",
                overflow: "hidden"
            })),
            transition('sbvisible <=> sbhidden', [
                animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
            ])
        ]),
        trigger('suggestionExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class SuggestionsComponent {
    showSuggestions: boolean = false;
    isMouseOver = false;

    @Input() suggestionLabel: string;
    @Input() suggestions: Suggestion[]
    @Input() showSug: boolean = false;
    @Input() textOnly: boolean = false;
    @Output() gotoSectionName = new EventEmitter<string>();

    constructor(private chref: ChangeDetectorRef) { }
    
    ngOnInit() {
        this.showSuggestions = this.showSug;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.showSug) {
            this.showSuggestions = this.showSug;
            this.chref.detectChanges();
        }
    }
    
    gotoSection(section) {
        this.gotoSectionName.emit(section);
    }
}
