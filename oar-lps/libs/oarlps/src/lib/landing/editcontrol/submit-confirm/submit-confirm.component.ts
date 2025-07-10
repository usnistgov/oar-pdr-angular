import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, ElementRef, ViewChild, Self, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataUpdateService } from '../../../landing/editcontrol/metadataupdate.service';
import {
    ReviewResponse,
    RevisionTypes,
    RevisionDetails,
    SubmissionData,
    GlobalService
} from '../../../shared/globals/globals';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatFormFieldModule } from '@angular/material/form-field';
import revisionhelp from '../../../../assets/site-constants/revision-help.json';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { SuggestionsComponent } from '../../../sidebar/suggestions/suggestions.component';
// import {
//     MatDialog,
//     MAT_DIALOG_DATA,
//     MatDialogActions,
//     MatDialogClose,
//     MatDialogContent,
//     MatDialogRef,
//     MatDialogTitle,
// } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTableModule } from '@angular/material/table';
import { RevisionDetailsComponent } from '../../revision-details/revision-details.component';
import { trigger, state, style, animate, transition } from '@angular/animations';

export interface PeriodicElement {
    situation: string;
    position: number;
    examples: string;
    edi: string;
    review: string;
    archival: string
}
  
const ELEMENT_DATA: PeriodicElement[] = [
    {position: 1, situation: 'Correcting or updating metadata in an EDI record', examples: 'Adding URLs for additional places of publication; adding narrative publications associated with the data; correcting typographical errors in the EDI record itself', edi: 'No', review: 'No; system notifies Division Chief or designee', archival: 'No'},
    {position: 2, situation: 'Deleting a published dataset distribution from an existing EDI record', examples: 'Data is available upon request but is no longer published', edi: 'No', review: 'Yes', archival: 'Yes, and the reason for removal is provided in the data description field. *'},
    {position: 3, situation: 'Minor change (i.e., does not impact use of data) to data listed in an EDI record and hosted on MIDAS', examples: 'Misspelled column header', edi: 'No', review: 'No; system notifies Division Chief or designee', archival: 'Old file will be archived'},
    {position: 4, situation: 'Major change+(i.e., impacts use of data) to data listed in an EDI record and hosted on MIDAS', examples: 'New version of data replaces old version of data', edi: 'Yes; Last Update Date will identify newest release', review: 'Yes', archival: 'Old file will be archived; new and old records will be updated to point to each other'},
    {position: 5, situation: 'Major change (i.e., impacts use of data) to data listed in an EDI record and hosted on MIDAS; see also situation 6, below', examples: 'Data is erroneous and is being replaced with new data', edi: 'Yes; Last Update Date will identify newest release. Previous record will be deactivated as in situation 6.', review: 'Yes', archival: 'Erroneous file will be archived and made unavailable to the public.* '},
    {position: 6, situation: 'New (updated) file added to record+', examples: 'Additional data gathered and inserted into previously uploaded spreadsheet', edi: 'No; Last Update Date will identify newest release', review: 'Yes', archival: 'No'},
    {position: 7, situation: 'Deactivating an EDI recordǂ', examples: 'Data is no longer available, valid, or supported', edi: 'n/a; deactivate EDI record', review: 'Yes', archival: 'Yes, and the reason for removal is provided in the data description field. *'},
];

@Component({
    selector: 'lib-submit-confirm',
    standalone: true,
    imports: [
        CommonModule,
        SuggestionsComponent,
        FormsModule,
        ButtonModule,
        TextFieldModule,
        RevisionDetailsComponent
],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './submit-confirm.component.html',
    styleUrls: ['./submit-confirm.component.css'],
    animations: [
        trigger('slideToggle', [
            state(
                'visible',
                style({
                    transform: 'translateX(0)',
                    opacity: 1,
                    display: 'block',
                })
            ),
            state(
                'hidden',
                style({
                    transform: 'translateX(100%)',
                    opacity: 0,
                    display: 'none',
                })
            ),
            transition('visible => hidden', [animate('300ms ease-in')]),
            transition('hidden => visible', [animate('300ms ease-out')]),
        ]),
    ]
})
    
export class SubmitConfirmComponent implements OnInit {
    // readonly dialogRef = inject(MatDialogRef<SubmitConfirmComponent>);
    suggestions: ReviewResponse;
    allRevisionTypes: RevisionDetails[] = [];
    revisionTypes = new RevisionTypes();
    revisionType: string;
    submissionData = new SubmissionData();
    showHelp: boolean = false;
    showSuggestion: boolean = true;
    componentHeight: number;
    public revisionHelp:{} = revisionhelp;

    displayedColumns: string[] = ['position', 'situation', 'examples'];
    dataSource = ELEMENT_DATA;

    @ViewChild('autosize') autosize: CdkTextareaAutosize;
    // @Input() revisionType: string;
    // @Output() changedData: EventEmitter<SubmissionData> = new EventEmitter();
    @Output() returnValue: EventEmitter<SubmissionData> = new EventEmitter();
    
    constructor(
        private mdupdsvc: MetadataUpdateService,
        public activeModal: NgbActiveModal,
        public globalService: GlobalService,
        @Self() private element: ElementRef,
        private chref: ChangeDetectorRef){
        // @Inject(MAT_DIALOG_DATA) public data) {

        this.globalService.watchSubmissionData(
            (data) => {
                this.submissionData = new SubmissionData(data);
        })
    }

    ngOnInit(): void {
        // this.revisionType = this.data.revisionType;

        this.allRevisionTypes = this.revisionTypes.getAllTypes();
        this.suggestions = this.mdupdsvc.getSuggestions();
    }

    ngAfterViewInit() {
        this.chref.detectChanges();
    }
    
    get maxHeight(): number {
        return this.element.nativeElement.firstChild.offsetHeight-150;
    }

    get isMetadataRevisionType() {
        return this.submissionData && this.submissionData.isRevision && this.submissionData.revisionIDs.includes(this.revisionTypes.getIDbyName('metadata'));
    }

    get hasRequiredItems() {
        return this.mdupdsvc.hasRequiredItems();
    }

    get hasWarnItems() {
        return this.mdupdsvc.hasWarnItems();
    }

    get hasRecommendedItems() {
        return this.mdupdsvc.hasRecommendedItems();
    }

    /**
     * When user clicks on Continue Download, close the pop up dialog and continue downloading.
     */
    continueSubmit() 
    {
        this.submissionData.goSubmit = true;
        // this.dialogRef.close(this.submissionData);
        this.returnValue.emit(this.submissionData);
        this.activeModal.close('Close click');
    }

    /** 
     * When user click on Cancel, close the pop up dialog and do nothing.
     */
    cancelSubmit() 
    {
        this.submissionData.goSubmit = false;
        // this.dialogRef.close(this.submissionData);
        this.returnValue.emit(this.submissionData);
        this.activeModal.close('Close click');
    }    

    // toggle(event) {
    //     console.log("Checkbox changed:", event);
    // }

    updateSubmissionData(event) {
        this.submissionData = event;

        //Broadcast the change
        this.globalService.setSubmissionData(this.submissionData);
    }

    onTextChange(event) {
        this.globalService.setSubmissionData(this.submissionData);
    }

    processCommand(event) {
        if (event == "getHelp") {
            this.showHelp = !this.showHelp;

            if (this.showSuggestion) this.showSuggestion = false;
            else {
                //Before display suggestion, Delay 350ms to allow the help window to go away.
                setTimeout(() => {
                    this.showSuggestion = true;
                    //Refresh screen
                    this.chref.detectChanges();
                }, 350);
            }
        }
    }
    
}
