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
    msg: string = "";
    currentValueChanged: boolean = false;

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

        if(this.originalURL == null || this.originalURL == undefined)
            this.originalURL = "Not available.";
    }

    /*
    *   Once user types in the description edit box, trim leading and ending 
    *   white spaces
    */
    onURLChange(event: any) {
        console.log("input value changed", event);
        // this.inputValue[this.field] = event; 
        this.currentValueChanged = this.originalURL != this.visitHomeURL;

        if(this.currentValueChanged) {
            this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataChanged"});
        }else{
            this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataReset"});
        }
    }

    clearText() {
        this.visitHomeURL = "";
        
        this.currentValueChanged = this.originalURL != this.visitHomeURL;

        if(this.currentValueChanged) {
            this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataChanged"});
        }else{
            this.dataChangedOutput.emit({"visitHomeURL": this.visitHomeURL, "action": "dataReset"});
        }
    }

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        switch(cmd) {
            case 'saveURL':
                if(!this.visitHomeURL || this.isValidUrl(this.visitHomeURL)){
                    this.msg = "";
                    this.currentValueChanged = false;
                    this.cmdOutput.emit({"command": cmd});
                }else{
                    this.msg = "Please enter a valid url.";
                }

                break;

            case 'undoCurrentChanges':
                this.msg = "";
                this.currentValueChanged = false;
                this.cmdOutput.emit({"command": cmd});
                break;

            default:

                break;
        }
    }

    /**
     * Validate an URL string
     * @param urlString URL
     * @returns 
     */
    isValidUrl(urlString: string) {
        var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
          '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }
}
