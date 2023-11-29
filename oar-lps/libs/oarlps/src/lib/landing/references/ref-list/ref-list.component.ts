import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NerdmRes } from '../../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../../shared/globals/globals';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Reference } from '../reference';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'lib-ref-list',
    templateUrl: './ref-list.component.html',
    styleUrls: ['../../landing.component.scss', '../references.component.css', './ref-list.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class RefListComponent implements OnInit {
    fieldName: string = 'references';
    tempInput: any = {};
    editBlockStatus: string = 'collapsed';
    placeholder: string = "Enter reference data below";
    orderChanged: boolean = false;
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose
    forceReset: boolean = false;

    // For warning pop up
    modalRef: any;

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
    @Output() dataCommand: EventEmitter<any> = new EventEmitter();
    @Output() editmodeOutput: EventEmitter<any> = new EventEmitter();

    constructor(public mdupdsvc : MetadataUpdateService,        
        private modalService: NgbModal,              
        private notificationService: NotificationService,
        public lpService: LandingpageService) { 

            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode ) {
                    if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                        if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                            if(this.dataChanged){
                                this.saveCurRef(false); // Do not refresh help text 
                            }else{
                                this.setMode(MODE.NORNAL, false);
                            }
                        }
                    }else{
                            if(sectionMode.section == this.fieldName && (!this.record[this.fieldName] || this.record[this.fieldName].length == 0)) {
                                this.onAdd();
                            }
                        }
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

    get isNormal() { return this.editMode==MODE.NORNAL || this.editMode==MODE.LIST }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isAdding() { return this.editMode==MODE.ADD }

    /**
     * Check if any reference data changed or reference order changed
     */
    get dataChanged() {
        let changed: boolean = false;
        if(!this.record || !this.record[this.fieldName] || this.record[this.fieldName].length == 0) 
            return this.orderChanged;

        for(let i=0; i < this.record[this.fieldName].length; i++) {
            changed = changed || this.record[this.fieldName][i].dataChanged;
        }
        
        return changed || this.orderChanged;
    }

    get dataChangedAndUpdated() {
        let changed: boolean = false;

        if(this.record && this.record[this.fieldName]) {
            for(let i=0; i < this.record[this.fieldName].length; i++) {
                changed = changed || this.mdupdsvc.fieldUpdated(this.fieldName, this.record['references'][i]['@id']);
            }
        }
        
        return changed || this.orderChanged;        
    }

    /**
     * set current mode to editing.
     */
    onEdit() {
        this.setMode(MODE.EDIT, true);
    }

    /**
     * Refresh the help text
     */
    refreshHelpText(help_topic: string = MODE.EDIT){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[help_topic];

        this.lpService.setSectionHelp(sectionHelp);
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.LIST, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;          

        switch ( this.editMode ) {
            case MODE.LIST:
                this.editBlockStatus = 'collapsed';

                // Back to add mode
                if(refreshHelp){
                    this.refreshHelpText(MODE.LIST);
                }
                break;            
            case MODE.EDIT:
                this.openEditBlock();

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.EDIT);
                }                
                break;
            case MODE.ADD:
                //Append a blank reference to the record and set current reference.
                if(!this.record[this.fieldName]){
                    this.record[this.fieldName] = [];
                }

                let newRef = {} as Reference;
                newRef["isNew"] = true;
                this.record[this.fieldName].push(newRef);
                
                this.currentRefIndex = this.record.references.length - 1;

                this.currentRef = this.record[this.fieldName][this.currentRefIndex];
                this.currentRef.dataChanged = true;
                // this.orderChanged = true;

                this.openEditBlock();

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.ADD);
                }                  
                break;
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'

                // Update help text
                if(refreshHelp){
                    this.refreshHelpText(MODE.NORNAL);
                }                  
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);

        this.editmodeOutput.next(this.editMode);    
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
     * Update reference data to the server
     */
    updateMatadata(ref: Reference = undefined, refid: string = undefined) {
        return new Promise<boolean>((resolve, reject) => {
            if(refid) {    // Update specific reference
                this.mdupdsvc.update(this.fieldName, ref, refid).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess){
                        this.notificationService.showSuccessWithTimeout("References updated.", "", 3000);
                        resolve(true);
                    }else{
                        let msg = "References update failed";
                        console.error(msg);
                        resolve(false);
                    }
                });
            }else{  // Update all references
                if(this.dataChanged){
                    let updmd = {};
                    updmd[this.fieldName] = this.record[this.fieldName];
                    this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                        // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                        if (updateSuccess){
                            this.notificationService.showSuccessWithTimeout("References updated.", "", 3000);
                            resolve(true);
                        }else{
                            let msg = "References update failed";
                            console.error(msg);
                            resolve(false);
                        }
                    });
                }
            }
        })
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
    saveCurRef(refreshHelp: boolean = true) {
        if(this.isAdding){
            if(this.currentRef.dataChanged){
                var postMessage: any = {};
                postMessage[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));

                //Delete temp keys
                console.log('postMessage[this.fieldName]01', postMessage[this.fieldName])
                postMessage[this.fieldName].forEach(ref => {
                    delete ref['isNew'];
                    delete ref['dataChanged'];
                });

                postMessage[this.fieldName] = JSON.parse('{"refType":"IsSupplementTo","title":"In-situ Raman spectroscopic measurements of the deformation region in indented glasses","issued":"2020-02","publishYear":"2002","citation":"Gerbig, Y. B., & Michaels, C. A. (2020). In-situ Raman spectroscopic measurements of the deformation region in indented glasses. Journal of Non-Crystalline Solids, 530, 119828. doi:10.1016/j.jnoncrysol.2019.119828","label":"Journal of Non-Crystalline Solids: In-situ Raman spectroscopic measurements of the deformation region in indented glasses","location":"https://doi.org/10.1016/j.jnoncrysol.2019.119828","@id":"#ref:10.1016/j.jnoncrysol.2019.119828","@type":["schema:Article"],"_extensionSchemas":["https://data.nist.gov/od/dm/nerdm-schema/v0.2#/definitions/DCiteReference"],"authors":["Gerbig, Y. B.", "Michaels, C. A."],"vol":"15","volNumber":"20","pages":"12345","doi":"10.1016/j.jnoncrysol.2019.119828","inPreparation":"yes"}');

                console.log('postMessage[this.fieldName]02', postMessage[this.fieldName])

                this.mdupdsvc.add(postMessage, this.fieldName).subscribe((rec) => {
                    if (rec){
                        this.record[this.fieldName] = JSON.parse(JSON.stringify(rec));
                        this.currentRef = this.record[this.fieldName].at(-1); // last reference
                        this.currentRefIndex = this.record[this.fieldName].length - 1;
                        this.currentRef.dataChanged = false;
                    }else{
                        let msg = "Failed to add reference";
                        console.error(msg);
                        return;
                    }
                });
            }else{  //If no data has been entered, remove this reference
                this.removeRef(this.currentRefIndex);
            }
        }else{
            this.updateMatadata(this.currentRef, this.currentRef["@id"]);
        }

        this.setMode(MODE.NORNAL, refreshHelp);
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoChanges() {
        if(this.dataChangedAndUpdated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    if(this.record && this.record.references){
                        this.record.references.forEach((ref) => {
                            ref.dataChanged = false;
                        });
                    }
                }else{
                    let msg = "Failed to undo " + this.fieldName + " metadata"
                    console.error(msg);
                    return;
                }
            });
        }
        this.record.references = JSON.parse(JSON.stringify(this.orig_record.references));

        this.orderChanged = false;
        this.dataCommand.next({"authors": this.record[this.fieldName], "action": "orderReset"});
        this.currentRefIndex = 0;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
        this.setMode(MODE.LIST);
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
                        let index = this.record[this.fieldName].findIndex((comp) => comp['@id'] == this.currentRef['@id']);

                        if(index > -1){
                            this.record[this.fieldName][index] = JSON.parse(JSON.stringify(ref));

                            this.currentRef = JSON.parse(JSON.stringify(ref));
                            this.currentRef.dataChanged = false;
                            this.record.references[this.currentRefIndex] = JSON.parse(JSON.stringify(this.currentRef));
                        }else{
                            //This should never happen
                        }
                    })                
            }
        }

        this.setMode(MODE.LIST);
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
        this.dataCommand.next({"authors": this.record[this.fieldName], "action": "orderChanged"});
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
        this.dataCommand.next({"authors": this.record[this.fieldName], "action": "orderChanged"});
        this.updateMatadata();
    }

    /**
     * Add an empty reference to the record and expand the edit window.
     */
    onAdd() {
        this.setMode(MODE.ADD);
    }

    /**
     * Handle actions from dragdrop component
     * @param action the action that the child component returned
     * @param index The index of the reference the action is taking place
     */
    onReferenceCommand(action: any, index: number = 0) {
        switch ( action.command.toLowerCase() ) {
            case 'edit':
                this.selectRef(index);
                this.onEdit();
                break;
            case 'delete':
                this.removeRef(index);
                break;
            case 'restore':
                this.mdupdsvc.undo(this.fieldName, this.record[this.fieldName][index]["@id"]).then((success) => {
                    if (success) {
                        this.currentRefIndex = 0;
                        this.currentRef = this.record[this.fieldName][this.currentRefIndex];
                        this.forceReset = true; // Force reference editor to reset data
                    } else {
                        let msg = "Failed to restore reference";
                        console.error(msg);
                    }
                })

                break;
            default:
                break;
        }
    }

    /**
     * Handle commands from edit component
     * @param cmd command from child component
     */
    onCommandChanged(cmd) {
        switch(cmd.command) {
            case 'saveCurrentChanges':
                this.saveCurRef();
                break;
            case 'undoCurrentChanges':
                this.undoCurRefChanges();
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
        if(index != this.currentRefIndex) { // user selected different reference
            if(this.currentRef.dataChanged) {
                this.updateMatadata(this.currentRef, this.currentRef["@id"]).then((success) => {
                    if(success){
                        this.setCurrentPage(index);

                        if(this.editMode==MODE.ADD || this.editMode==MODE.EDIT)
                            this.editMode = MODE.EDIT;
                        else    
                            this.editMode = MODE.NORNAL;

                        this.editmodeOutput.next(this.editMode); 
                    }else{
                        let msg = "Update failed";
                        console.error(msg);
                    }
                })
            }else{
                this.setCurrentPage(index);
            }
        }

        // let sectionHelp: SectionHelp = {} as SectionHelp;
        // sectionHelp.section = this.fieldName;
        // sectionHelp.topic = HelpTopic['dragdrop'];

        // this.lpService.setSectionHelp(sectionHelp);
    }

    setCurrentPage(index: number){
        if(this.record[this.fieldName] && this.record[this.fieldName].length > 0 && !this.isAdding){
            this.forceReset = (this.currentRefIndex != -1);

            this.currentRefIndex = index;
            this.currentRef = this.record[this.fieldName][index];
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
            return 'var(--editable)';
        }
    }

    /**
     * When reference data changed (child component), set the flag in record level.
     * Also update the reference data. 
     */
    onReferenceChange(event) {
        this.record['references'][this.currentRefIndex] = JSON.parse(JSON.stringify(event.ref));
        this.record['references'][this.currentRefIndex].dataChanged = event.dataChanged;
        this.currentRef = this.record['references'][this.currentRefIndex];
    }

    /**
     * Determine icon class of add button
     * If edit mode is normal, display enabled icon.
     * Otherwise display disabled icon.
     * @returns add button icon class
     */    
    addIconClass() {
        if(this.isNormal){
            return "fas fa-plus fa-lg icon_enabled";
        }else{
            return "fas fa-plus fa-lg icon_disabled";
        }
    }

    /**
     * Return width of the control box
     * If there are more than one reference, return 30 so the three buttons will align vertically.
     * If only one reference, return 100 so the three buttons will align horizontally.
     * @returns width in px
     */
    getControlBoxWidth() {
        if(this.record[this.fieldName] && this.record[this.fieldName].length > 1)
            return 30;
        else
            return 100;
    }

    getRefBoxWidth() {
        return "calc(100%-" + this.getControlBoxWidth() + 'px)'; 
    }

    /**
     * Hide this edit block
     * @param refreshHelp indicates if the help text needs be refreshed
     */
    hideEditBlock(refreshHelp: boolean = true) {
        this.setMode(MODE.NORNAL, refreshHelp);

        if(this.record)
            this.dataCommand.next({"data": this.record[this.fieldName], "action": "hideEditBlock"});
    }

    /**
     * Undo all changes
     */
    undoAllChangesConfirmation(){
        var message = 'This will undo all reference changes.';

        this.modalRef = this.modalService.open(ConfirmationDialogComponent, { centered: true });
        this.modalRef.componentInstance.title = 'Please confirm';
        this.modalRef.componentInstance.btnOkText = 'Confirm';
        this.modalRef.componentInstance.btnCancelText = 'Cancel';
        this.modalRef.componentInstance.message = message;
        this.modalRef.componentInstance.showWarningIcon = true;
        this.modalRef.componentInstance.showCancelButton = true;

        this.modalRef.result.then((result) => {
            if ( result ) {
                this.undoChanges();
            }else{
                console.log("User changed mind.");
            }
        }, (reason) => {
        });
    }    
}
