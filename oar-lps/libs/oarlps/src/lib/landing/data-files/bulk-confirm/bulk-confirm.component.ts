import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-bulk-confirm',
  standalone: true,
  imports: [ ButtonModule ],
  templateUrl: './bulk-confirm.component.html',
  styleUrls: ['./bulk-confirm.component.css']
})
export class BulkConfirmComponent implements OnInit {

    @Output() returnValue: EventEmitter<boolean> = new EventEmitter();
    
    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
    }

    /**
     * When user clicks on Continue Download, close the pop up dialog and continue downloading.
     */
    continueBulkDownload() 
    {
        this.returnValue.emit(true);
        this.activeModal.close('Close click');
    }

    /** 
     * When user click on Cancel, close the pop up dialog and do nothing.
     */
    cancelBulkDownload() 
    {
        this.returnValue.emit(false);
        this.activeModal.close('Close click');
    }    
}
