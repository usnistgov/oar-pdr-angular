import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../../../shared/globals/globals';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-bulk-confirm',
  standalone: true,
  imports: [ CommonModule, FontAwesomeModule, MatButtonModule, MatIconModule, MatTooltipModule ],
  templateUrl: './bulk-confirm.component.html',
  styleUrls: ['./bulk-confirm.component.css']
})
export class BulkConfirmComponent implements OnInit {

    //icon class names
    // downloadIcon = iconClass.DOWNLOAD;
    // closeIcon = iconClass.CLOSE;

    faDownload = faDownload;
    faXmark = faXmark;

    @Output() returnValue: EventEmitter<boolean> = new EventEmitter();

    constructor(
        public iconLibrary: FaIconLibrary,
        public dialogRef: MatDialogRef<BulkConfirmComponent>) {

        // iconLibrary.addIcons(faDownload, faXmark);
    }

    ngOnInit(): void {
    }

    /**
     * When user clicks on Continue Download, close the pop up dialog and continue downloading.
     */
    continueBulkDownload()
    {
        this.returnValue.emit(true);
        this.dialogRef.close('Close click');
    }

    /**
     * When user click on Cancel, close the pop up dialog and do nothing.
     */
    cancelBulkDownload()
    {
        this.returnValue.emit(false);
        this.dialogRef.close('Close click');
    }

}
