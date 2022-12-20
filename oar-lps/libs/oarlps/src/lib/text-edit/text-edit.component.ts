import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-text-edit',
  templateUrl: './text-edit.component.html',
  styleUrls: ['../landing/landing.component.scss', './text-edit.component.css']
})
export class TextEditComponent implements OnInit {
    prevVal: string = "";
    currentVal: string = "";
    // editboxWidth: string = "calc(100% - 60px)"; // Default only text box and two icon buttons
    controlBoxWidth: string = "60px !important"
    editing: boolean = false;

    @Input() textField: string = "";
    @Input() dragDropIcon: boolean = false;
    @Input() editButton: boolean = true; // Default button
    @Input() deleteButton: boolean = true; // Default button
    @Input() plusButton: boolean = false; // If this is true, no edit/remove/undo button
    @Input() restoreButton: boolean = false;
    @Input() submitButton: boolean = false;
    @Input() placeHolderText: string = "Input text here";
    @Input() disableControl: boolean = false;
    @Input() showBorder: boolean = true; // display the border between textbox and control
    @Input() forceReset: boolean = false;
    @Input() dataChanged: boolean = false;

    //Output actions: "Delete", "Cancel", "Save", etc.
    @Output() command_out = new EventEmitter<any>();

    constructor() { 
    }

    ngOnInit(): void {
        if(this.plusButton){
            this.editing = true;
            this.editButton = false;
            this.deleteButton = false;
            this.restoreButton = false;
            this.dragDropIcon = false;
            this.submitButton = false;
            this.controlBoxWidth = "27px !important";
        } else if(this.submitButton) {
            this.editing = true;
            this.editButton = false;
            this.deleteButton = false;
            this.restoreButton = false;
            this.dragDropIcon = false;
            this.plusButton = false;
            this.controlBoxWidth = "27px !important";
        }

        let buttonCount = 0;
        if(this.plusButton) buttonCount += 1;
        if(this.submitButton) buttonCount += 1;
        if(this.editButton) buttonCount += 1;
        if(this.deleteButton) buttonCount += 1;
        if(this.restoreButton) buttonCount += 1;

        this.controlBoxWidth = buttonCount * 29 + "px !important";
        if(this.dragDropIcon) buttonCount += 1;
        // this.editboxWidth = "calc(100% - " + buttonCount*30 + "px)"; //Reserve space for icon buttons

        this.prevVal = this.textField;
        this.currentVal = this.textField;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.forceReset && changes.forceReset.currentValue && this.editing){
            this.reset();
        }

        if(changes.textField) {
            this.prevVal = this.textField;
            this.currentVal = this.textField;
        }

        if(changes.dataSavedToServer) {
            console.log("Data changed.", changes.dataChanged);
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

    controlBorderStyle() {
        if(this.showBorder){
            return "1px solid var(--background-light-grey02)";
        }else{
            return "0px solid var(--background-light-grey02)"
        }
    }

    /**
     * Remove/Undo based on current edit status
     */
    removeUndo() {
        if(this.editing){
            this.currentVal = this.prevVal;
            this.command_out.next({"value":this.currentVal, "command":"UndoEdit"});
        }else{
            this.command_out.next({"value":this.currentVal, "command":"Delete"});
        }
        
        this.editing = false;
    }

    /**
     * Restore - tell parent component to restore original value
     */
    restore() {
        this.command_out.next({"value":this.currentVal, "command":"Restore"});

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

    /**
     * Submit this item
     */
    submit() {
        this.command_out.next({"value":this.currentVal, "command":"submit"});
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
     * Return the opacity of dragdrop icon to indicate enable/disable status
     * @returns opacity
     */
    ddIconOpacity() {
        if(this.editing || this.disableControl){
            return 0.3;
        }else{
            return 1;
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

            case 'restore':
                return "Restore from saved value";

                break;
            default: 
                return "";
                break;
         }
    }    
}
