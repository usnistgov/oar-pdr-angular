import { Component, EventEmitter, inject, Inject, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';  
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../globals/globals';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ NgbModule, CommonModule, FontAwesomeModule ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
   
    warningIcon = iconClass.WARNING;

    @Input() public title: string;
    @Input() public message: string;
    @Input() public btnOkText: string;
    @Input() public btnCancelText: string;
    @Input() public showWarningIcon: boolean;
    @Input() public showCancelButton: boolean;
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(
        @Inject(NgbActiveModal) public activeModal: NgbActiveModal,
        public iconLibrary: FaIconLibrary,) { 
        
        iconLibrary.addIcons(
            faTriangleExclamation
        );
    }

    ngOnInit() {
    }

    public decline() {
        // this.cmdOutput.emit("decline");
        this.activeModal.close(false);
    }

    public accept() {
        // this.cmdOutput.emit("accept");
        this.activeModal.close(true);
    }

    public dismiss() {
        // this.cmdOutput.emit("dismiss");
        this.activeModal.dismiss();
    }
}
