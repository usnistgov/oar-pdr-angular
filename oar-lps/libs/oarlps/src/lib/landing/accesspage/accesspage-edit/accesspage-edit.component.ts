import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NerdmComp } from '../../../nerdm/nerdm';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'lib-accesspage-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TooltipModule,
        ButtonModule
    ],
    templateUrl: './accesspage-edit.component.html',
    styleUrls: ['../../landing.component.scss', './accesspage-edit.component.css']
})
export class AccesspageEditComponent implements OnInit {
    originalApage: NerdmComp = {} as NerdmComp;
    editBlockStatus: string = 'collapsed';
    accessPage: NerdmComp = {} as NerdmComp;

    @Input() currentApage: NerdmComp = {} as NerdmComp;
    @Input() editMode: string = "edit";
    @Input() fieldName: string;
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(public mdupdsvc : MetadataUpdateService) { }

    ngOnInit(): void {
        if(this.currentApage) {
            this.originalApage = JSON.parse(JSON.stringify(this.accessPage));
            this.accessPage = JSON.parse(JSON.stringify(this.currentApage));
        }else
            this.accessPage = {} as NerdmComp;
    }

    get isEditing() { return this.editMode=="edit" };
    get isAdding() { return this.editMode=="add" };
    get noURL() {
        return !this.accessPage || !this.accessPage.accessURL || this.accessPage.accessURL.trim() == "";
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.editMode && changes.editMode.currentValue == "normal") {
            this.reset();
        }

        if(changes.currentApage) {
            if(this.currentApage) {
                this.originalApage = JSON.parse(JSON.stringify(this.currentApage));
                this.accessPage = JSON.parse(JSON.stringify(this.currentApage));
            }else{
                this.originalApage = {} as NerdmComp;
                this.accessPage = {} as NerdmComp;
            }
        }
    }

    getRecordBackgroundColor() {
        let dataChanged = this.accessPage? this.accessPage.dataChanged : false;
        let bkcolor = this.mdupdsvc.getFieldStyle(this.fieldName, dataChanged)

        return bkcolor;
    }

    reset() {
        this.editBlockStatus = 'collapsed';
    
    }

    onChange() {
        if(this.accessPage)
            this.accessPage.dataChanged = true;

        this.currentApage = JSON.parse(JSON.stringify(this.accessPage));
        this.dataChanged.emit({"accessPage": this.currentApage, "dataChanged": true});
    }

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.cmdOutput.emit({"command": cmd});
    }    
}
