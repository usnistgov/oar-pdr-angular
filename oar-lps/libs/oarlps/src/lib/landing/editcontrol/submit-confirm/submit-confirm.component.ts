import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubmitResponse } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-submit-confirm',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './submit-confirm.component.html',
  styleUrls: ['./submit-confirm.component.css']
})
export class SubmitConfirmComponent implements OnInit {

    @Input() submitResponse: SubmitResponse = {} as SubmitResponse;
    @Output() returnValue: EventEmitter<boolean> = new EventEmitter();

    constructor(public activeModal: NgbActiveModal,) { }

    ngOnInit(): void {
    }

    get hasRequiredItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.failures &&  this.submitResponse.validation.failures.length > 0;
    }

    get hasRecommendedItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.warnings &&  this.submitResponse.validation.warnings.length > 0;
    }

    get hasNiceToHaveItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.recommendations &&  this.submitResponse.validation.recommendations.length > 0;
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
