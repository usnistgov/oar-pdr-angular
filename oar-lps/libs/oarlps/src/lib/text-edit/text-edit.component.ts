import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-text-edit',
  templateUrl: './text-edit.component.html',
  styleUrls: ['./text-edit.component.css']
})
export class TextEditComponent implements OnInit {
    prevVal: string = "";
    currentVal: string = "";
    editboxWidth: string = "calc(100% - 60px)"; // Default only text box and two icon buttons
    controlBoxWidth: string = "60px !important"
    editing: boolean = false;

    @Input() textField: string = "";
    @Input() dragDropIcon: boolean = false;
    @Input() plusButton: boolean = false; // If this is true, no edit/remove/undo button
    @Input() trashButton: boolean = false;
    @Input() placeHolderText: string = "Input text here";
    @Input() disableControl: boolean = false;
    @Input() forceReset: boolean = false;

    //Output actions: "Delete", "Cancel", "Save", etc.
    @Output() command_out = new EventEmitter<any>();

    constructor() { 
        console.log("Constrcting ===============")
    }

    ngOnInit(): void {
        console.log("dragDropIcon", this.dragDropIcon);
        if(this.plusButton){
            this.editing = true;
            this.dragDropIcon = false;
            this.trashButton = false;
            this.controlBoxWidth = "27px !important";
            this.editboxWidth = "calc(100% - 30px)";
        } 
        if(this.dragDropIcon) this.editboxWidth = "calc(100% - 90px)"; //Reserve space for dragdrop icon button

        this.prevVal = this.textField;
        this.currentVal = this.textField;
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes-text edit', changes);
        if(changes.forceReset && changes.forceReset.currentValue && this.editing){
            this.reset();
        }
    }

    /**
     * Edit/Save based on current edit status
     */
    editSave() {
        // If we are editing, save changes
        if(this.editing){
            this.onSave();
        }else{ // Otherwise, set to editing mode
            this.prevVal = this.currentVal; // For undo purpose
            this.editing = true;
            this.command_out.next({"value":this.currentVal, "command":"Edit"});
        }
    }

    onSave() {
        this.editing = false;
        this.command_out.next({"value":this.currentVal, "command":"Save"});
    }

    onUpdate() {
        this.command_out.next({"value":this.currentVal, "command":"Update"});
    }

    /**
     * Remove/Undo based on current edit status
     */
    removeUndo() {
        // If we are editing, undo changes
        if(this.editing){
            this.currentVal = this.prevVal;
            this.command_out.next({"value":this.currentVal, "command":"Undo"});
        }else{ // Otherwise, delete this item
            this.command_out.next({"value":this.currentVal, "command":"Delete"});
        }

        this.editing = false;
    }

    /**
     * Add this item
     */
    add() {
        this.command_out.next({"value":this.currentVal, "command":"Add"});
        this.prevVal = "";
        this.currentVal = "";
    }

    resetValue() {
        this.prevVal = this.textField;
        this.currentVal = this.textField;
    }

    reset() {
        this.editing = false;
        this.resetValue();
    }

    /**
     * Return icon class of edit/save button
     * @returns icon class
     */
    getEditIconClass() {
        if(this.editing){
            return "faa faa-check";
        }else{
            return "faa faa-pencil";
        }
    }

    /**
     * Return icon class of delete/cancel button
     * @returns icon class
     */
    getDelIconClass() {
        if(this.editing){
            return "faa faa-undo";
        }else{
            return "faa faa-trash";
        }
    }    

    /**
     * Return tooltip text of edit/save button
     * @returns 
     */
    getTooltip(item: string) {
        switch ( item ) {
            case 'edit':
                if(this.editing){
                    return "Save changes";
                }else{
                    return "Edit this item";
                }

                break;
            case 'delete':
                if(this.editing){
                    return "Undo changes";
                }else{
                    return "Remove this item";
                }

                break;

            default: 
                return "";
                break;
         }
    }    
}
