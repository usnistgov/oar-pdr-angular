import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { iconClass } from '../globals/globals';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, MatIconModule ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {


    @Input() public matDialog: boolean = true;
    @Input() public title: string = '';
    @Input() public message: string = '';
    @Input() public btnOkText: string = 'OK';
    @Input() public btnCancelText: string = 'Cancel';
    @Input() public showWarningIcon: boolean = false;
    @Input() public showCancelButton: boolean = true;
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    }

    ngOnInit() {
        if(this.matDialog){
            this.title = this.data.title;
            this.message = this.data.message;
            this.btnOkText = this.data.btnOkText;
            this.btnCancelText = this.data.btnCancelText;
            this.showWarningIcon = this.data.showWarningIcon;
            this.showCancelButton = this.data.showCancelButton;
        }
    }

    public decline() {
        this.dialogRef.close(false);
    }

    public accept() {
        this.dialogRef.close(true);
    }

    public dismiss() {
        this.dialogRef.close();
    }
}