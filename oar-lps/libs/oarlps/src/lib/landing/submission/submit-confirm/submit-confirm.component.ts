import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, ElementRef, ViewChild, Self, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataUpdateService } from '../../../landing/editcontrol/metadataupdate.service';
import {
    ReviewResponse,
    RevisionTypes,
    RevisionDetails,
    SubmissionData,
    Reviewers,
    GlobalService
} from '../../../shared/globals/globals';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import revisionhelp from '../../../../assets/site-constants/revision-help.json';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { SuggestionsComponent } from '../../../sidebar/suggestions/suggestions.component';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import { RevisionDetailsComponent } from '../../revision-details/revision-details.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { iconClass } from '../../../shared/globals/globals';
import { PeopleComponent } from '../../people/people.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SDSuggestion, SDSIndex, StaffDirectoryService, AuthenticationService } from 'oarng';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';


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
        RevisionDetailsComponent,
        PeopleComponent,
        NgbModule,
        AutoCompleteModule
],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './submit-confirm.component.html',
    styleUrls: ['./submit-confirm.component.css', '../../landing.component.scss'],
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
    showHelp: boolean = false; // Used to control display of help section within the component
    showSuggestion: boolean = true; // Used to control display of suggestion section within the component
    showReviewersWidget: boolean = false; // Used to control display of reviewers widget
    componentHeight: number;
    public revisionHelp:{} = revisionhelp;

    displayedColumns: string[] = ['position', 'situation', 'examples'];
    dataSource = ELEMENT_DATA;

    //icon class names
    editIcon = iconClass.EDIT;
    closeIcon = iconClass.CLOSE;
    closeCircleIcon = iconClass.CLOSE_CIRCLE;

    // Fro people service
    showDropdown = false;
    minPromptLength = 2;

    // the index we will download after the first minPromptLength (2) characters are typed
    index: SDSIndex|null = null;

    // the current list of suggested completions matching what has been typed so far.
    peopleSuggestions: SDSuggestion[] = [];

    query: string = '';
    // the suggested completion that was picked; it contains a reference to the full record
    selectedSuggestion: SDSuggestion|null = null;

    // the full record for the selected person
    selected: any = null;

    // the organizations that the selected person is a member of
    selectedOrgs: any[]|null = null;

    placeHolderText: string;


    @ViewChild('autosize') autosize: CdkTextareaAutosize;
    // @Input() revisionType: string;
    // @Output() changedData: EventEmitter<SubmissionData> = new EventEmitter();
    @Output() returnValue: EventEmitter<SubmissionData> = new EventEmitter();

    constructor(
        private mdupdsvc: MetadataUpdateService,
        public activeModal: NgbActiveModal,
        public globalService: GlobalService,
        private ps: StaffDirectoryService,
        @Self() private element: ElementRef,
        public authsvc: AuthenticationService,
        private eRef: ElementRef,
        private chref: ChangeDetectorRef){
        // @Inject(MAT_DIALOG_DATA) public data) {

        this.globalService.watchSubmissionData(
            (data) => {
                this.submissionData = new SubmissionData(data);
            })
        
        this.authsvc.getCredentials().subscribe(
            (creds) => {
                ps.setAuthToken(creds.token);
            }
        )
    }

    ngOnInit(): void {
        // this.revisionType = this.data.revisionType;

        this.allRevisionTypes = this.revisionTypes.getAllTypes();
        this.suggestions = this.mdupdsvc.getSuggestions();
        this.submissionData.reviewers = [] as Reviewers[];
        this.placeHolderText = "Enter at least " + this.minPromptLength + " chars to search...";

        // this.submissionData.reviewers = [{
        //     nistId: '12345678',
        //     firstName: 'Jane',
        //     lastName: 'Doe',
        //     eMail: 'test@nist.gov'
        // },{
        //     nistId: '12345678',
        //     firstName: 'John',
        //     lastName: 'Doe',
        //     eMail: 'test1@nist.gov'
        // }]
        
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

    get reviewerPrompt() {
        if(this.submissionData && this.submissionData.reviewers && this.submissionData.reviewers.length > 0) {
            return "Edit technical reviewers";
        }else {
            return "Add technical reviewers (optional)";
        }
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
    
    toggleReviewersWidget() {
        this.showReviewersWidget = !this.showReviewersWidget;
        this.chref.detectChanges();
    }

    removeReviewer(index: number) {
        if (this.submissionData && this.submissionData.reviewers) {
            this.submissionData.reviewers.splice(index, 1);
            this.globalService.setSubmissionData(this.submissionData);
            this.chref.detectChanges();
        }
    }

    onDataChanged(dataChanged: any) {
        switch(dataChanged.action) {
            case 'fieldChanged':
                break;

            case 'peopleChanged':
                let selected = dataChanged.selectedPeopleRecord;

                this.submissionData.reviewers.push(
                    {
                        nistId: '',
                        firstName: selected.firstName,
                        lastName: selected.lastName,
                        eMail: selected.email
                    }                                           
                )

                this.globalService.setSubmissionData(this.submissionData);
                this.chref.detectChanges();

                break;     
            
            case 'orgChanged':
                break;     
            
            default:
                break;
        }
    }

    // People service
    set_suggestions(ev: any) {
        if (ev.target.value.length >= this.minPromptLength) {  // don't do anything unless we have 2 chars
            if (!this.index) {
                let lQuery = ev.target.value as string;
                // retrieve initial index
                this.ps.getPeopleIndexFor(lQuery).subscribe(
                    (pi) => {
                        // save it to use with subsequent typing
                        this.index = pi;
                        if (this.index != null) {
                            // pull out the matching suggestions
                            this.peopleSuggestions = (this.index as SDSIndex).getSuggestions(ev.target.value);
                            this.index = null;
                        }
                    },
                    (e) => {
                        console.error('Failed to pull people index for "'+ev.target.value+'": '+e)
                    }                    
                );
            }
            else
                // pull out the matching suggestions
                this.peopleSuggestions = (this.index as SDSIndex).getSuggestions(ev.target.value);
        }
        else if (this.index) {
            this.index = null;
            this.peopleSuggestions = [];
        }

        this.showDropdown = this.peopleSuggestions.length > 0 && ev.target.value.length > 0;
        this.chref.detectChanges();
    }    

    getFullRecord(ev: SDSuggestion) {
        let sugg = ev;
        
        sugg.getRecord().subscribe({
            next: (rec) => { 
                this.selected = rec;
                if(this.selected.lastName && this.selected.firstName){
                    this.getOrgs(this.selectedSuggestion);
                }

                this.query = this.selected.firstName + " " + this.selected.lastName;
                    
                this.submissionData.reviewers.push({
                    nistId: this.selected.id,
                    firstName: this.selected.firstName,
                    lastName: this.selected.lastName,
                    eMail: this.selected.emailAddress ? this.selected.emailAddress : ""
                });
                
                this.globalService.setSubmissionData(this.submissionData);
                this.showDropdown = false;
                this.chref.detectChanges();
            },
            error: (err) => {
                console.error("Failed to resolve suggestion into person data");
            }
        });
    }    

    getOrgs(selected: SDSuggestion) {
        if (selected) {
            this.ps.getOrgsFor(selected.id).subscribe({
                next: (recs) => {
                    //Get first 3 units and then reverse the order
                    this.selectedOrgs = recs.slice(0, 3).reverse();
                    this.selectedSuggestion = null;
                },
                error: (err) => {
                    console.error("Failed to resolve person id into org data");
                }
            });
        }
    }    

    get enableScroll(): boolean {
        return this.peopleSuggestions.length > 5;
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.showDropdown = false;
        }
    }    
}
