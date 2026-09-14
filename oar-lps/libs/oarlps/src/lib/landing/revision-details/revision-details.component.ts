import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReviewResponse,
    RevisionTypes,
    RevisionDetails,
    SubmissionData,
    iconClass
} from '../../shared/globals/globals';
import { CheckboxModule } from 'primeng/checkbox';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MdsCheckboxComponent } from '../../shared/mds-checkbox/mds-checkbox.component';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faCircleQuestion,
    faCircle,
    faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'revision-details',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TextFieldModule,
        CheckboxModule,
        MdsCheckboxComponent,
        FontAwesomeModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './revision-details.component.html',
    styleUrl: './revision-details.component.css'
})
export class RevisionDetailsComponent {
    suggestions: ReviewResponse;
    allRevisionTypes: RevisionDetails[] = [];
    revisionTypes = new RevisionTypes();
    revisionType: string;
    policyPageLink: string = "";

    //icon class
    // circleQuestionIcon = iconClass.CIRCLE_QUESTION;
    // circleIcon = iconClass.CIRCLE;
    // arrowUpRightFromSquareIcon = iconClass.ARROW_UP_RIGHT_FROM_SQUARE;

    faCircleQuestion = faCircleQuestion;
    faCircle = faCircle;
    faArrowUpRightFromSquare = faArrowUpRightFromSquare;

    @ViewChild('autosize') autosize: CdkTextareaAutosize;

    @Input() submissionData: SubmissionData;
    @Output() changedData: EventEmitter<SubmissionData> = new EventEmitter();
    @Output() command: EventEmitter<any> = new EventEmitter();
        
    constructor(public iconLibrary: FaIconLibrary, public cdRef: ChangeDetectorRef) { 
        // iconLibrary.addIcons(
        //     faCircleQuestion,
        //     faCircle,
        //     faArrowUpRightFromSquare
        // );
    }

    ngOnInit(): void {
        this.allRevisionTypes = this.revisionTypes.getAllTypes();
    }

    /**
     * On checkbox change
     * @param event 
     */
    toggle(id) {
        if (this.submissionData.includes(id)) 
            this.submissionData.removeRevisionID(id)
        else
            this.submissionData.addRevisionID(id);

        this.changedData.emit(this.submissionData);
    }

    checked(id: number) {
        return this.submissionData.includes(id);
    }

    /**
     * On purpose change
     * @param event 
     */
    onTextChange(event) {
        this.changedData.emit(this.submissionData);
    }

    /**
     * Signal parent component to display help if available.
     */
    getHelp() {
        this.command.emit("getHelp");
    }
}
