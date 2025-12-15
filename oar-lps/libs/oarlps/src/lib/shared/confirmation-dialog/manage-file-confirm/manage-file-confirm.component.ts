import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-manage-file-confirm',
  standalone: true,
  imports: [NgbModule, CommonModule, MatCheckboxModule, MatButtonModule, MatIconModule],
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

    constructor(@Inject(NgbActiveModal) public activeModal: NgbActiveModal) { }
    
    public decline() {
        // this.cmdOutput.emit("decline");
        this.returnValue.accept = false;
        this.activeModal.close(this.returnValue);
    }

    public accept() {
        // this.cmdOutput.emit("accept");
        this.returnValue.accept = true;
        this.returnValue.newData = true;
        this.activeModal.close(this.returnValue);
    }

    public dismiss() {
        this.returnValue.accept = false;
        this.activeModal.dismiss(this.returnValue);
    }
}
