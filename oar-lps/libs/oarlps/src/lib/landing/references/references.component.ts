import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService } from '../landingpage.service';
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
    styleUrls: ['../landing.component.css', './references.component.css'],
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
    currentRef: Reference = {} as Reference;
    currentRefIndex: number = 0;
    isEditing: boolean = false;
    dataChanged: boolean = false;
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose
    disableEditing: boolean = false;
    forceSave: boolean = false;

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

            this.lpService.watchEditing((section) => {
                if(section != "" && section != this.fieldName) {
                    this.onSave();
                }
            })
    }

    ngOnInit(): void {
        if(this.record && this.record['references'].length > 0) {
            this.currentRef = this.record['references'][0];

            //Keep a copy of the record for undo purpose
            this.orig_record = JSON.parse(JSON.stringify(this.record));
        }
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get nonEditing() { return !this.isEditing || this.disableEditing }

    startEditing() {
        // If is editing, save data to the draft server
        if(this.isEditing){
            this.onSave();
            this.setStatus(false);
        }else{ // If not editing, enter edit mode
            this.setStatus(true);
            this.openEditBlock(); 
        }
    }

    setStatus(isEditing: boolean) {
        this.isEditing = isEditing;
        if(isEditing){
            this.openEditBlock();
            //Tell the system who is editing
            this.lpService.setEditing(this.fieldName);
        }else{
            this.editBlockStatus = 'collapsed'
            //Tell the system nobody is editing so system can display general help text
            this.lpService.setEditing("");
        }
    }

    openEditBlock() {
        this.editBlockStatus = 'expanded';
        this.lpService.setCurrentSection('references');
    }

    onSave() {
        this.editBlockStatus = 'collapsed';
        this.updateMatadata();
        this.setStatus(false);
    }

    onCancel() {
        this.editBlockStatus = 'collapsed';
        this.undoEditing();
    }

    getEditIconClass() {
        if(this.isEditing){
            return "faa faa-check icon_enabled";
        }else{
            return "faa faa-pencil icon_enabled";
        }
    }

    updateMatadata() {
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

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        if(this.updated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    this.record.references.forEach((ref) => {
                        ref.dataChanged = false;
                    });

                }else
                    console.error("Failed to undo " + this.fieldName + " metadata");
                    return;
            });
        }else{
            this.record.references = JSON.parse(JSON.stringify(this.orig_record.references));
        }

        this.dataChanged = false;
        this.currentRefIndex = 0;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
        this.setStatus(false);
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
    getReferenceText(ref){
        if(ref['citation'] && ref['citation'].trim() != "") 
            return ref['citation'];
        if(ref['label'] && ref['label'].trim() != "")
            return ref['label'];
        if(ref['location'] && ref['location'].trim() != "")
            return ref['location'];
        return " ";
    }    

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
    
    dragDropped(event: CdkDragDrop<number>) {
        if (!this.dropListReceiverElement) {
          return;
        }
        this.currentRefIndex = event.item.data;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.dataChanged = true;
        this.setStatus(true);

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }

    removeRef(index: number) {
        this.record.references.splice(index,1);
        this.dataChanged = true;
        this.updateMatadata();
        this.setStatus(true);
    }

    onAdd() {
        this.record.references.unshift({} as Reference);
        this.currentRefIndex = 0;
        this.currentRef = this.record["references"][0];
        this.setStatus(true);
        this.openEditBlock();
        this.dataChanged = true;
    }

    selectRef(index: number) {
        if(this.record["references"] && this.record["references"].length > 0){
            if(this.currentRefIndex != -1)
                this.forceSave = true;

            this.currentRefIndex = index;
            this.currentRef = {...this.record["references"][index]};
            this.forceSave = false;
        }
    }

    getActiveItemStyle(index: number) {
        if(index == this.currentRefIndex) {
            return { 'background-color': 'var(--background-light-grey)'};
        } else {
            return {'background-color': this.getBackgroundColor(index)};
        }
    }

    getBackgroundColor(index: number){
        if(this.record['references'][index].dataChanged){
            return '#FCF9CD';
        }else{
            return 'white';
        }
    }

    getRecordBackgroundColor() {
        if(this.dataChanged){
            return '#FCF9CD';
        }else{
            return 'white';
        }
    }

    /**
     * When reference data changed, set the flag so 
     */
    onDataChange(dataChanged: boolean) {
        this.dataChanged = dataChanged;
    }

    undoIconClass() {
        if(this.nonEditing){
            return "faa faa-undo icon_disabled";
        }else{
            return "faa faa-undo icon_enabled";
        }
    }
}
