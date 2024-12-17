import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Reference } from '../reference';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { TextEditModule } from '../../../text-edit/text-edit.module';

@Component({
  selector: 'lib-ref-author',
  standalone: true,
  imports: [
      CommonModule,
      TextEditModule
  ],
  templateUrl: './ref-author.component.html',
  styleUrls: ['./ref-author.component.css']
})
export class RefAuthorComponent implements OnInit {
    editingAuthorIndex: number = -1; // Indicating which author is being edited
    forceReset: boolean = false;
    currentAuthorIndex: number = 0;
    currentAuthor: string; // for drag drop
    currentEditingAuthor: string // for editing
    newAuthor: string = "";
    originalRef: Reference = {} as Reference;

    @Input() ref: Reference = {} as Reference;
    @Output() dataChanged: EventEmitter<boolean> = new EventEmitter();

    //Drag and drop
    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    constructor() { }

    ngOnInit(): void {
        if(this.ref) {
            this.originalRef = JSON.parse(JSON.stringify(this.ref));
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.forceReset = true;
        this.editingAuthorIndex = -1;
    }
    
    editAction(action: any, index: number = 0) {
        switch ( action.command.toLowerCase() ) {
            case "delete":
                this.removeAuthor(index);
                break;
            case "add": // add author
                this.newAuthor = action.value;
                this.addAuthor()
                break;
            case "save":
                this.ref["authors"][index] = action.value;
                this.onChange(true);
                if(this.editingAuthorIndex == index)
                    this.editingAuthorIndex = -1;
                break;
            case "edit":
                this.editingAuthorIndex = index;
                break;
            case "undo":
                this.editingAuthorIndex = -1;
                break;                  
            default: 
                // 
                break;
        }

        this.forceReset = false;
    }

    /**
     * Once author info changed, update parent component
     * @param updateCitation 
     */
    onChange(updateCitation:boolean = false) {
        this.ref.dataChanged = true;

        this.dataChanged.emit(true);
    }

    /**
     * Add an author to the list
     */
    addAuthor() {
        if(this.ref["authors"]){
            this.ref.authors.push(this.newAuthor);
        }else{
            this.ref["authors"] = [this.newAuthor];
        }

        this.newAuthor = "";
        this.editingAuthorIndex = -1;
        this.onChange(true);
    }

    /**
     * Edit or save author based on current status
     * @param index The index of the author to be edited
     */
    editAuthor(index: number) {
        if(this.editingAuthorIndex == index){ // Save author
            this.ref["authors"][index] = this.currentEditingAuthor;
            this.editingAuthorIndex = -1;
            this.onChange(true);
        }else{ // start editing
            this.currentEditingAuthor = this.ref["authors"][index];
            this.editingAuthorIndex = index;
        }
    }

    /**
     * Return icon class of edit/save button
     * @param index index of authors
     * @returns icon class
     */
     getEditIconClass(index: number) {
        if(this.editingAuthorIndex == index){
            return "faa faa-check";
        }else{
            return "fas fa-pencil fa-sm";
        }
    }

    /**
     * Return icon class of delete/cancel button
     * @param index index of authors
     * @returns icon class
     */
    getDelIconClass(index: number) {
        if(this.editingAuthorIndex == index){
            return "fas fa-times";
        }else{
            return "fas fa-trash-alt";
        }
    }

    removeAuthor(index: number) {
        if(this.editingAuthorIndex == index){ // Cancel editing
            this.ref["authors"][index] = this.originalRef["authors"][index];
        }else{ // Delete author
            this.ref.authors.splice(index, 1);
        }

        this.editingAuthorIndex = -1;
        this.onChange(true);
    }

    /**
     * Return tooltip text of delete/cancel button
     * @param index index of authors
     * @returns 
     */
    getDelButtonTooltip(index: number) {
        if(this.editingAuthorIndex == index){
            return "Cancel changes";
        }else{
            return "Remove this author";
        }
    }

    /**
     * Return tooltip text of edit/save button
     * @param index index of authors
     * @returns 
     */
    getEditButtonTooltip(index: number) {
        if(this.editingAuthorIndex == index){
            return "Save changes";
        }else{
            return "Edit this author";
        }
    }

    // Drag and drop
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
    
            moveItemInArray(this.ref['authors'], dragIndex, dropIndex);
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

        if(this.editingAuthorIndex != -1){
            this.ref["authors"][this.editingAuthorIndex] = this.currentEditingAuthor;
            this.editingAuthorIndex = -1;
        }

        this.onChange(true);

        this.currentAuthorIndex = event.item.data;
        this.currentAuthor = this.ref.authors[this.currentAuthorIndex];
        this.dataChanged.emit(true);

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }
}
