import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReviewResponse,
    RevisionTypes,
    RevisionDetails,
    SubmissionData
} from '../../shared/globals/globals';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'revision-details',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatCheckboxModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        TextFieldModule,
        MatTooltipModule
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

    @ViewChild('autosize') autosize: CdkTextareaAutosize;

    @Input() submissionData: SubmissionData;
    @Output() changedData: EventEmitter<SubmissionData> = new EventEmitter();
    @Output() command: EventEmitter<any> = new EventEmitter();
        
    ngOnInit(): void {
        console.log("submissionData", this.submissionData);
        this.allRevisionTypes = this.revisionTypes.getAllTypes();
    }

    /**
     * On checkbox change
     * @param event 
     */
    toggle(event, id) {
        console.log("Checkbox changed:", event);
        if (event.checked) {
            this.submissionData.addRevisionID(id);
        } else {
            this.submissionData.removeRevisionID(id)
        }
        this.changedData.emit(this.submissionData);
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
