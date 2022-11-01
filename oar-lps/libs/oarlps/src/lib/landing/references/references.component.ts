import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ReferencesPopupComponent } from './references-popup/references-popup.component';
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
    }

    ngOnInit(): void {
        if(this.record && this.record['references'].length > 0) {
            this.currentRef = this.record['references'][0];
        }
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    startEditing() {
        // If is editing, save data to the draft server
        if(this.isEditing){
            this.onSave();
            this.isEditing = false;
        }else{ // If not editing, enter edit mode
            this.isEditing = true;
            this.openEditBlock(); 
        }
    }

    openEditBlock() {
        this.editBlockStatus = 'expanded';
        this.lpService.setCurrentSection('references');
    }

    onSave() {
        this.editBlockStatus = 'collapsed';
        this.updateMatadata();
        this.isEditing = false;
    }

    onCancel() {
        this.editBlockStatus = 'collapsed';
        this.undoEditing();
        this.isEditing = false;
    }

    getEditIconClass() {
        if(this.isEditing){
            return "faa faa-check icon_enabled";
        }else{
            return "faa faa-pencil icon_enabled";
        }
    }

    updateMatadata() {
        let updmd = {};
        updmd[this.fieldName] = this.record[this.fieldName];
        this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
            // console.log("###DBG  update sent; success: "+updateSuccess.toString());
            if (updateSuccess)
                this.notificationService.showSuccessWithTimeout("References updated.", "", 3000);
            else
                console.error("acknowledge references update failure");
        });
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.record.references.forEach((ref) => {
                    ref.dataChanged = false;
                });
                this.record.references.dataChanged = false;
                this.currentRefIndex = 0;
                this.currentRef = this.record.references[this.currentRefIndex];
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else
                console.error("Failed to undo keywords metadata")
        });
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
        console.log('event', event);
        this.currentRefIndex = event.item.data;
        this.currentRef = this.record.references[this.currentRefIndex];
        this.record.references.dataChanged = true;

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }

    removeRef(index: number) {
        this.record.references.splice(index,1);
        this.updateMatadata();
    }

    onAdd() {
        this.record.references.unshift({} as Reference);
        this.currentRefIndex = 0;
        this.currentRef = this.record["references"][0];
        this.isEditing = true;
        this.openEditBlock();
    }

    selectRef(index: number) {
        if(this.record["references"] && this.record["references"].length > 0){
            this.currentRefIndex = index;
            this.currentRef = this.record["references"][index];
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
        if(this.record['references'].dataChanged){
            return '#FCF9CD';
        }else{
            return 'white';
        }
    }
}
