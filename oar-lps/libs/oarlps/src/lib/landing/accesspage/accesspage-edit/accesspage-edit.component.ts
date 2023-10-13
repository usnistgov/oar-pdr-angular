import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../../nerdm/nerdm';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';

@Component({
  selector: 'lib-accesspage-edit',
  templateUrl: './accesspage-edit.component.html',
  styleUrls: ['../../landing.component.scss', './accesspage-edit.component.css']
})
export class AccesspageEditComponent implements OnInit {
    originalApage: NerdmComp = {} as NerdmComp;
    editBlockStatus: string = 'collapsed';
    fieldName: string = 'components';

    @Input() accessPage: NerdmComp = null;
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(public mdupdsvc : MetadataUpdateService) { }

    ngOnInit(): void {
        if(this.accessPage) this.originalApage = JSON.parse(JSON.stringify(this.accessPage));
    }

    get isEditing() { return this.editMode=="edit" };
    get isAdding() { return this.editMode=="add" };
    get noURL() {
        return !this.accessPage.accessURL || this.accessPage.accessURL.trim() == "";
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.editMode && changes.editMode.currentValue == "normal") {
            this.reset();
        }

        if(changes.accessPage) {
            if(this.accessPage) {
                this.originalApage = JSON.parse(JSON.stringify(this.accessPage));
            }else{
                this.originalApage = undefined;
            }
        }
    }

    getRecordBackgroundColor() {
        let bkcolor = this.mdupdsvc.getFieldStyle(this.fieldName, this.accessPage.dataChanged)

        return bkcolor;
    }

    reset() {
        this.editBlockStatus = 'collapsed';
    
    }

    onChange() {
        // console.log("accessPage02", this.accessPage)
        this.accessPage.dataChanged = true;
        this.dataChanged.emit({"accessPage": this.accessPage, "dataChanged": true});
    }

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.cmdOutput.emit({"command": cmd});
    }    
}
