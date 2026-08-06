import { Component, Input, SimpleChanges } from '@angular/core';
import { SubmissionStatus, SubmissionFeedback } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'feedback',
    standalone: true,
    imports: [ CommonModule, FontAwesomeModule ],
    templateUrl: './submit-feedback.component.html',
    styleUrl: './submit-feedback.component.css',
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class SubmitFeedbackComponent {
    label: any;

    faChevronUp = faChevronUp;
    faChevronDown = faChevronDown;

    viewBlockStatus: string = 'expanded';

    @Input() feedback: SubmissionFeedback[] = [];
    @Input() type: string = "";

    ngOnInit() {
        this.label = this.getLabel(this.type);
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    /**
     * Generate label based on different feedback type
     * @param type: Feedback type
     * @returns Label and color object
     */
    getLabel(type: string = '') {
        let label = {
            "label": "",
            "color": "black"
        };

        switch (type) {
            case 'req':
                label.label = "The following must be addressed:";
                label.color = "red";
                break;
            
            case 'warn':
                label.label = "The following should be addressed:"
                label.color = "orange";
                break;
            
            case 'comment':
                label.label = "The following may be adressed:"
                label.color = "blue";
                break;
            
            default:
                label.label = "The following are not categorized:"
                label.color = "black";
                break;
        }

        return label;
    }    
}
