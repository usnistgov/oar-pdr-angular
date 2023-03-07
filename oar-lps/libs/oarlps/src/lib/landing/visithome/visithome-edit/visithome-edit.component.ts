import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lib-visithome-edit',
  templateUrl: './visithome-edit.component.html',
  styleUrls: ['./visithome-edit.component.css', '../../landing.component.scss']
})
export class VisithomeEditComponent implements OnInit {
    tempReturn: any;
    defaultText: string = "Enter description here...";
    originalURL: string = "";

    @Input() visitHomeURL: any;
    @Input() editMode: string;
    @Input() dataChanged: boolean = false;
    @Input() updated: boolean = false;
    @Input() backgroundColor: string = 'var(--editable)';
    @Output() dataChangedOutput: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
        this.originalURL = this.visitHomeURL;
        this.visitHomeURL = this.originalURL;
        if(this.originalURL == null || this.originalURL == undefined)
            this.originalURL = "Not available.";
    }

    /*
    *   Once user types in the description edit box, trim leading and ending 
    *   white spaces
    */
    onURLChange(event: any) {
        // console.log("input value changed", event);
        // this.inputValue[this.field] = event; 
        this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataChanged"});
    }

    clearText() {
        this.visitHomeURL = "";
        this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataChanged"});
    }

    commandOut(cmd: string) {
        this.cmdOutput.emit({"command": cmd});
    }
}
