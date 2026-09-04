import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-manage-file-confirm',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './manage-file-confirm.component.html',
  styleUrl: './manage-file-confirm.component.css'
})
export class ManageFileConfirmComponent {
    returnValue = {
        accept: true,
        newData: true
    }

    @Input() public title: string;
    @Input() public message: string;
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(public dialogRef: MatDialogRef<ManageFileConfirmComponent>) { }

    public decline() {
        // this.cmdOutput.emit("decline");
        this.returnValue.accept = false;
        this.dialogRef.close(this.returnValue);
    }

    public accept() {
        // this.cmdOutput.emit("accept");
        this.returnValue.accept = true;
        this.returnValue.newData = true;
        this.dialogRef.close(this.returnValue);
    }

    public dismiss() {
        this.returnValue.accept = false;
        this.dialogRef.close(this.returnValue);
    }
}