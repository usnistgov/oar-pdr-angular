import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, SectionMode, MODE } from '../landingpage.service';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Reference } from './reference';


@Component({
    selector: 'app-references',
    templateUrl: './references.component.html',
    styleUrls: ['../landing.component.scss', './references.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class ReferencesComponent implements OnInit {
    fieldName: string = 'references';
    tempInput: any = {};
    editBlockStatus: string = 'collapsed';
    placeholder: string = "Enter reference data below";
    orderChanged: boolean = false;
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose
    disableEditing: boolean = false;
    forceReset: boolean = false;

    // "add", "edit" or "normal" mode. In edit mode, "How would you enter reference data?" will not display.
    // Default is "normal" mode.
    editMode: string = MODE.NORNAL; 

    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    // passed in by the parent component:
    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean = false;

    constructor(public mdupdsvc : MetadataUpdateService,        
        private ngbModal: NgbModal,                
        private notificationService: NotificationService,
        public lpService: LandingpageService) { 

            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                    console.log("Save changes...");

                    if(this.dataChanged){
                        this.onSave();
                    }

                    this.setMode(MODE.NORNAL);
                }
            })
    }

    ngOnInit(): void {
        if(this.record && this.record['references'] && this.record['references'].length > 0) {
            this.currentRef = this.record['references'][0];

            //Keep a copy of the record for undo purpose
            this.orig_record = JSON.parse(JSON.stringify(this.record));
        }
    }

    get isNormal() { return this.editMode==MODE.NORNAL }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isAdding() { return this.editMode==MODE.ADD }

    get editBtnTooltip() { return this.isNormal? "Edit selected reference" : "Save all changes to server" }

    /**
     * Check if any reference data changed or reference order changed
     */
    get dataChanged() {
        let changed: boolean = false;
        if(!this.record || !this.record.references || this.record.references.length == 0) return this.orderChanged;
        for(let i=0; i < this.record.references.length; i++) {
            changed = changed || this.record.references[i].dataChanged;
        }
        
        return changed || this.orderChanged;
    }

    get dataChangedAndUpdated() {
        let changed: boolean = false;

        for(let i=0; i < this.record.references.length; i++) {
            changed = changed || this.mdupdsvc.fieldUpdated(this.fieldName, this.record['references'][i]['@id']);
        }
        
        return changed || this.orderChanged;        
    }

    /**
     * When user clicks on the edit (pencil/check) button, if current mode is editing or adding
     * save changes and set normal mode. If current mode is normal, set current mode to editing.
     */
    toggleEditing() {
        // If is editing, save data to the draft server
        if(this.isEditing || this.isAdding){
            this.onSave();
            this.setMode(MODE.NORNAL);
        }else{ // If not editing, enter edit mode
            this.setMode(MODE.EDIT);
        }
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;
        switch ( this.editMode ) {
            case MODE.EDIT:
                this.openEditBlock();
                //Broadcast who is editing

                this.lpService.setEditing(sectionMode);
                break;
            case MODE.ADD:
                //Append a blank reference to the record and set current reference.
                if(!this.record["references"]){
                    this.record["references"] = [];
                }

                this.record["references"].push({} as Reference);
                
                this.currentRefIndex = this.record.references.length - 1;
                // this.record["references"][this.currentRefIndex].dataChanged = true;
                this.currentRef = this.record["references"][this.currentRefIndex];
                this.lpService.setEditing(sectionMode);
                this.openEditBlock();
                break;
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                //Broadcast that nobody is editing so system can display general help text
                this.lpService.setEditing(sectionMode);
                break;
        }
    }

    /**
     * Expand the edit block that user can edit reference data
     */
    openEditBlock() {
        this.editBlockStatus = 'expanded';

        //Broadcast current edit section so landing page will scroll to the section
        this.lpService.setCurrentSection('references');
    }

    /**
     * Save changes to the server and set edit mode to "normal"
     */
    onSave() {
        // Collapse the edit block
        this.editBlockStatus = 'collapsed';

        // Update reference data
        this.updateMatadata();

        // Set edit mode to "normal"
        this.setMode(MODE.NORNAL);
    }

    /**
     * Update reference data to the server
     */
    updateMatadata(refid: string = undefined) {
        if(refid) {    // Update specific reference
            this.mdupdsvc.update(this.fieldName, this.currentRef, refid).then((updateSuccess) => {
                // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                if (updateSuccess){
                    this.notificationService.showSuccessWithTimeout("References updated.", "", 3000);
                }else
                    console.error("acknowledge references update failure");
            });
        }else{  // Update all references
            if(this.dataChanged){
                let updmd = {};
                updmd[this.fieldName] = this.record[this.fieldName];
                this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess){
                        this.notificationService.showSuccessWithTimeout("References updated.", "", 3000);
                    }else
                        console.error("acknowledge references update failure");
                });
            }
        }
    }

    /**
     * Check if the given reference is empty
     * @param ref Reference to be checked
     */
    isEmpty(ref: Reference) {
        if(!ref) return true;

        if(ref["@id"] || (ref.authors && ref.authors.length > 0 ) || ref.doi || ref.label || ref.location || ref.pages || ref.publishYear || ref.refType || ref.title || ref.vol || ref.volNumber)
            return false;
        else    
            return true;
    }

    /**
     * Save current reference
     */
    saveCurRef() {
        console.log('this.currentRef', this.currentRef);
        if(this.isAdding){
            if(this.currentRef.dataChanged){
                // this.mdupdsvc.add(this.currentRef, this.fieldName).subscribe((returnRef) => {

                // });
            }else{  //If no data has been entered, remove this reference

            }

        }else{
            this.updateMatadata(this.currentRef["@id"]);
        }

        this.setMode(MODE.NORNAL);
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoChanges() {
        if(this.dataChangedAndUpdated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    this.record.references.forEach((ref) => {
                        ref.dataChanged = false;
                    });

                }else
                    console.error("Failed to undo " + this.fieldName + " metadata");
                    return;
            });
        }
        this.record.references = JSON.parse(JSON.stringify(this.orig_record.references));

        this.orderChanged = false;
        this.currentRefIndex = 0;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
        this.setMode(MODE.NORNAL);
    }

    /**
     * Revert current reference to saved data
     */
    undoCurRefChanges() {
        if(this.currentRef.dataChanged) {
            if(this.isAdding) {
                if(this.record.references.length == 1) {
                    this.record.references = [];
                    this.currentRefIndex = 0;
                }else {
                    this.record.references.splice(this.currentRefIndex, 1);
                    this.currentRefIndex = 0;
                    this.currentRef = this.record.references[this.currentRefIndex];
                }
            }else{
                this.mdupdsvc.loadSavedSubsetFromMemory(this.fieldName, this.currentRef["@id"]).subscribe(
                    (ref) => {
                        this.currentRef = JSON.parse(JSON.stringify(ref));
                        this.currentRef.dataChanged = false;
                        this.record.references[this.currentRefIndex] = JSON.parse(JSON.stringify(this.currentRef));
                    })                
            }
        }

        this.setMode(MODE.NORNAL);
    }

    /**
     * Function to Check whether given record has references that need to be displayed
     */
    hasDisplayableReferences() {
        if (this.record && this.record['references'] && this.record['references'].length > 0) 
            return true;
        return false;
    }


    /**
     * Return the link text of the given reference.  The text returned will be one of
     * the following, in order or preference:
     * 1. the value of the citation property (if set and is not empty)
     * 2. the value of the label property (if set and is not empty)
     * 3. to "URL: " appended by the value of the location property.
     * @param ref   the NERDm reference object
     */
    // getReferenceText(ref){
    //     if(ref['citation'] && ref['citation'].trim() != "") 
    //         return ref['citation'];
    //     if(ref['label'] && ref['label'].trim() != "")
    //         return ref['label'];
    //     if(ref['location'] && ref['location'].trim() != "")
    //         return ref['location'];
    //     return " ";
    // }    

    /**
     * Drag drop function
     */
    dragEntered(event: CdkDragEnter<number>) {
        const drag = event.item;
        const dropList = event.container;
        const dragIndex = drag.data;
        const dropIndex = dropList.data;
    
        this.dragDropInfo = { dragIndex, dropIndex };
    
        const phContainer = dropList.element.nativeElement;
        const phElement = phContainer.querySelector('.cdk-drag-placeholder');
    
        if (phElement) {
          phContainer.removeChild(phElement);
          phContainer.parentElement?.insertBefore(phElement, phContainer);
    
          moveItemInArray(this.record['references'], dragIndex, dropIndex);
        }
    }
    
    /**
     * Drag drop function
     * @param event 
     * @returns 
     */
    dragMoved(event: CdkDragMove<number>) {
        if (!this.dropListContainer || !this.dragDropInfo) return;
    
        const placeholderElement =
          this.dropListContainer.nativeElement.querySelector(
            '.cdk-drag-placeholder'
          );
    
        const receiverElement =
          this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
            ? placeholderElement?.nextElementSibling
            : placeholderElement?.previousElementSibling;
    
        if (!receiverElement) {
          return;
        }
    
        receiverElement.style.display = 'none';
        this.dropListReceiverElement = receiverElement;
    }
    
    /**
     * Drag drop function
     */
    dragDropped(event: CdkDragDrop<number>) {
        if (!this.dropListReceiverElement) {
          return;
        }
        this.currentRefIndex = event.item.data;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.orderChanged = true;
        // Update reference data
        this.updateMatadata();

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }

    /**
     * Remove reference and update the server
     * @param index Index of the reference to be deleted
     */
    removeRef(index: number) {
        this.record.references.splice(index,1);
        this.orderChanged = true;
        this.updateMatadata();
    }

    /**
     * Add an empty reference to the record and expand the edit window.
     */
    onAdd() {
        this.setMode(MODE.ADD);
    }

    /**
     * Handle actions from child component
     * @param action the action that the child component returned
     * @param index The index of the reference the action is taking place
     */
    onReferenceChange(action: any, index: number = 0) {
        switch ( action.command.toLowerCase() ) {
            case 'delete':
                this.removeRef(index);
                break;
            case 'restore':
                this.mdupdsvc.undo(this.fieldName, this.record["references"][index]["@id"]).then((success) => {
                    if (success) {
                        this.record[this.fieldName][index].dataChanged = false;
                        this.currentRef = this.record.references[this.currentRefIndex];
                        this.forceReset = true;
                    } else {
                        console.error("Failed to restore reference");
                    }
                })

                break;
            default:
                break;
        }
    }

    /**
     * Set current reference to the selected one
     * @param index The index of the selected reference
     */
    selectRef(index: number) {
        console.log(this.mdupdsvc.fieldUpdated(this.fieldName, this.record["references"][index]['@id']))

        if(index != this.currentRefIndex) { // user selected different reference
            if(this.currentRef.dataChanged) {
                this.updateMatadata(this.currentRef["@id"]);
            }
        }

        if(this.record["references"] && this.record["references"].length > 0 && !this.isAdding){
            this.forceReset = (this.currentRefIndex != -1);

            this.currentRefIndex = index;
            this.currentRef = this.record["references"][index];
        }
    }

    /**
     * Return the style class of a given reference:
     * If this is the active reference, set border color to blue. Otherwise set border color to grey.
     * If this reference's data changed, set background color to yellow. Otherwise set to white.
     * @param index The index of the active reference
     * @returns 
     */
    getActiveItemStyle(index: number) {
        if(index == this.currentRefIndex) {
            // return { 'background-color': 'var(--background-light-grey)'};
            return { 'background-color': this.getBackgroundColor(index), 'border': '1px solid var(--active-item)'};
        } else {
            return {'background-color': this.getBackgroundColor(index), 'border':'1px solid var(--background-light-grey)'};
        }
    }

    /**
     * Return background color of the given reference based on dataChanged flag of the reference
     * @param index The index of the target reference
     * @returns background color
     */
    getBackgroundColor(index: number){
        // if(this.record['references'][index].dataChanged){
        if(this.mdupdsvc.fieldUpdated(this.fieldName, this.record['references'][index]['@id'])){
            return 'var(--data-changed-saved)';
        }else if(this.record['references'][index].dataChanged){
            return 'var(--data-changed)';
        }else{
            return 'white';
        }
    }


    /**
     * Retuen background color of the whole record (the container of all references) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    getRecordBackgroundColor() {
        if(this.dataChangedAndUpdated){
            return 'var(--data-changed-saved)';
        }else if(this.dataChanged){
            return 'var(--data-changed)';
        }else{
            return 'white';
        }
    }

    /**
     * When reference data changed (child component), set the flag in record level.
     * Also update the reference data. 
     */
    onDataChange(event) {
        this.record['references'][this.currentRefIndex] = JSON.parse(JSON.stringify(event.ref));
        this.record['references'][this.currentRefIndex].dataChanged = event.dataChanged;
    }

    /**
     * Determine icon class of undo button
     * If edit mode is normal, display disabled icon.
     * Otherwise display enabled icon.
     * @returns undo button icon class
     */
    undoIconClass() {
        return this.dataChanged || this.isEditing? "faa faa-undo icon_enabled" : "faa faa-undo icon_disabled";
    }

    /**
     * Determine icon class of add button
     * If edit mode is normal, display enabled icon.
     * Otherwise display disabled icon.
     * @returns add button icon class
     */    
    addIconClass() {
        if(this.isNormal){
            return "faa faa-plus faa-lg icon_enabled";
        }else{
            return "faa faa-plus faa-lg icon_disabled";
        }
    }

    /**
     * Determine icon class of edit button
     * If edit mode is normal, display edit icon.
     * Otherwise display check icon.
     * @returns edit button icon class
     */   
    editIconClass() {
        if(this.isNormal){
            if(this.hasDisplayableReferences())
                return "faa faa-pencil icon_enabled";
            else
                return "faa faa-pencil icon_disabled";
        }else{
            return "faa faa-pencil icon_disabled";
        }
    }

    /**
     * Return width of the control box
     * If there are more than one reference, return 30 so the three buttons will align vertically.
     * If only one reference, return 100 so the three buttons will align horizontally.
     * @returns width in px
     */
    getControlBoxWidth() {
        if(this.record["references"] && this.record["references"].length > 1)
            return 30;
        else
            return 100;
    }

    getRefBoxWidth() {
        return "calc(100%-" + this.getControlBoxWidth() + 'px)'; 
    }
}
