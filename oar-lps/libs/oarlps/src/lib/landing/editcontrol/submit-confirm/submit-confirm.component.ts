import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MetadataUpdateService } from '../../../landing/editcontrol/metadataupdate.service';
import { ReviewResponse, Suggestion } from '../../../shared/globals/globals';
import { SuggestionsComponent } from '../../../sidebar/suggestions/suggestions.component';

@Component({
  selector: 'lib-submit-confirm',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, SuggestionsComponent
  ],
  templateUrl: './submit-confirm.component.html',
  styleUrls: ['./submit-confirm.component.css']
})
export class SubmitConfirmComponent implements OnInit {
    suggestions: ReviewResponse;

    @Output() returnValue: EventEmitter<boolean> = new EventEmitter();

    constructor(public activeModal: NgbActiveModal,
                private mdupdsvc: MetadataUpdateService) { }

    ngOnInit(): void {
        this.suggestions = this.mdupdsvc.getSuggestions();
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
        this.returnValue.emit(true);
        this.activeModal.close('Close click');
    }

    /** 
     * When user click on Cancel, close the pop up dialog and do nothing.
     */
    cancelSubmit() 
    {
        this.returnValue.emit(false);
        this.activeModal.close('Close click');
    }    
}
