import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../../nerdm/nerdm';

@Component({
  selector: 'lib-single-apage',
  templateUrl: './single-apage.component.html',
  styleUrls: ['./single-apage.component.css']
})
export class SingleApageComponent implements OnInit {
    originalApage: NerdmComp = {} as NerdmComp;
    editBlockStatus: string = 'collapsed';

    @Input() accessPage: NerdmComp = null;
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
        if(this.accessPage) this.originalApage = JSON.parse(JSON.stringify(this.accessPage));
    }

    get isEditing() { return this.editMode=="edit" };
    get isAdding() { return this.editMode=="add" };
    
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
            // console.log("accessPage01", this.accessPage);
        }
    }

    reset() {
        this.editBlockStatus = 'collapsed';
    
    }

    onChange() {
        // console.log("accessPage02", this.accessPage)
        this.accessPage.dataChanged = true;
        this.dataChanged.emit({"accessPage": this.accessPage, "dataChanged": true});
    }
}
