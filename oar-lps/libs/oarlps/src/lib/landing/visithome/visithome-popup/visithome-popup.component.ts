import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'lib-visithome-popup',
  templateUrl: './visithome-popup.component.html',
  styleUrls: ['./visithome-popup.component.css']
})
export class VisithomePopupComponent implements OnInit {
    @Input() inputValue: any;
    @Input() field: string;
    @Input() title: string;
    @Input() message?: string;
    @Output() returnValue: EventEmitter<any> = new EventEmitter();

    tempReturn: any;
    defaultText: string = "Enter description here...";
    originalURL: string = "";

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        this.originalURL = this.inputValue[this.field];
        this.tempReturn = this.originalURL;
        if(this.originalURL == null || this.originalURL == undefined)
            this.originalURL = "Not available.";

        console.log("originalURL", this.originalURL)
    }

    /*
     *   Function to emit decription and close this pop up window
     */
    saveLandingPageURL() {
        this.returnValue.emit(this.inputValue);
        window.scroll(0, 0);
        this.activeModal.close('Close click');
    }

    /*
    *   Function to close this pop up window without emit any change
    */
    cancelChange() {
        window.scroll(0, 0);
        this.activeModal.close('Close click');
    }

    /*
    *   Once user types in the description edit box, trim leading and ending 
    *   white spaces
    */
    onURLChange(event: any) {
        console.log("input value changed", event);
        this.inputValue[this.field] = event; 
    }

    clearText() {
        this.tempReturn = "";
    }
}
