import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../../../shared/globals/globals';

@Component({
  selector: 'app-bulk-confirm',
  standalone: true,
  imports: [ ButtonModule, FontAwesomeModule ],
  templateUrl: './bulk-confirm.component.html',
  styleUrls: ['./bulk-confirm.component.css']
})
export class BulkConfirmComponent implements OnInit {

    //icon class names
    downloadIcon = iconClass.DOWNLOAD;
    closeIcon = iconClass.CLOSE;

    faDownload = faDownload;
    faXmark = faXmark;

    @Output() returnValue: EventEmitter<boolean> = new EventEmitter();
    
    constructor(
        public iconLibrary: FaIconLibrary,
        public activeModal: NgbActiveModal) { 
        
        iconLibrary.addIcons(faDownload, faXmark);
    }

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
