import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingpageService } from '../../landingpage.service';
import { iconClass } from '../../../shared/globals/globals';

@Component({
  selector: 'lib-visithome-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  templateUrl: './visithome-edit.component.html',
  styleUrls: ['./visithome-edit.component.css', '../../landing.component.scss']
})
export class VisithomeEditComponent implements OnInit {
    tempReturn: any;
    defaultText: string = "Enter description here...";
    originalURL: string = "";
    msg: string = "";
    currentValueChanged: boolean = false;

    //icon class names
    saveIcon = iconClass.SAVE;
    undoIcon = iconClass.UNDO;

    @Input() visitHomeURL: any;
    @Input() editMode: string;
    @Input() dataChanged: boolean = false;
    @Input() updated: boolean = false;
    @Input() startEditing: boolean = false;
    @Input() backgroundColor: string = 'var(--editable)';
    @Output() dataChangedOutput: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    @ViewChild('url') urlElement: ElementRef;
    
    constructor(private chref: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.originalURL = this.visitHomeURL;

        if(this.originalURL == null || this.originalURL == undefined)
            this.originalURL = "Not available.";
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.startEditing) {
            setTimeout(()=>{ // this will make the execution after the above boolean has changed
                if(this.urlElement) {
                    const textArea = this.urlElement.nativeElement as HTMLTextAreaElement;
                    textArea.focus();
                    this.chref.detectChanges();
                }
            },0); 
        }
    }

    /*
    *   Once user types in the description edit box, trim leading and ending 
    *   white spaces
    */
    onURLChange(event: any) {
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
