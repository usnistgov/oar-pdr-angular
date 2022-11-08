import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Reference } from '../reference';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'lib-single-ref',
    templateUrl: './single-ref.component.html',
    styleUrls: ['./single-ref.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class SingleRefComponent implements OnInit {
    defaultText: string = "Enter citation here";
    refTypes: string[] = ["IsDocumentedBy","IsCitedBy"];
    
    // Input method. 1 = DOI, 2=Ref data, 3=Citation text
    inputMethod: number = 1; 

    contentCollapsed: boolean = true;
    citationLocked: boolean = false;
    editBlockStatus: string = 'collapsed';

    // to be deleted
    newAuthor: string = "";
    forceReset: boolean = false;
    originalRef: Reference = {} as Reference;
    editingAuthorIndex: number = -1; // Indicating which author is being edited

    //Drag and drop
    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    currentAuthorIndex: number = 0;
    currentAuthor: string; // for drag drop
    currentEditingAuthor: string // for editing

// end to be deleted



    @Input() ref: Reference = {} as Reference;
    @Output() dataChanged: EventEmitter<boolean> = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
        if(this.ref) {
            this.originalRef = JSON.parse(JSON.stringify(this.ref));
        }
    }

    onChange(updateCitation:boolean = false) {
        this.ref.dataChanged = true;

        if(updateCitation) this.updateCitation();

        this.dataChanged.emit(true);
    }

    // to be deleted
    ngOnChanges(changes: SimpleChanges): void {
        console.log("changes - singal ref", changes);
        this.forceReset = true;
        this.editingAuthorIndex = -1;
    }
    
    /**
     * When reference data changed, set the flag so 
     */
    onDataChange(dataChanged: boolean) {
        this.onChange(true);
    }

    /**
     * Update citation text based on related fields.
     * If it's locked, citation text will be entered by user manually.
     */
    updateCitation() {
        // this.ref.citation = "";
        // if(!this.citationLocked) {
        //     // Add authors
        //     if(this.ref.authors && this.ref.authors.length > 0){
        //         for(let i = 0; i <= this.ref.authors.length-1; i++) {
        //             this.ref.citation += this.ref.authors[i];
        //             if(i < this.ref.authors.length-2) this.ref.citation += ", ";
        //             if(i == this.ref.authors.length-2) this.ref.citation += ", & ";
        //             if(i == this.ref.authors.length-1) this.ref.citation += " ";
        //         }
        //     }

        //     // Add publish year
        //     if(this.ref.issued)
        //         this.ref.citation += "(" + this.ref.issued.substring(0, 4) + "). ";

        //     // Add title
        //     if(this.ref.title)
        //         this.ref.citation += this.ref.title + ". ";

        //     // Add Journal
        //     if(this.ref.label)
        //         this.ref.citation += this.ref.label + ". ";

        //     let addPeriod: boolean = false;
        //     // Add Vol
        //     if(this.ref.vol){
        //         this.ref.citation += this.ref.vol;  
        //         addPeriod = true;
        //     }
                
        //     // Add Vol number
        //     if(this.ref.volNumber){
        //         this.ref.citation += "(" + this.ref.volNumber + ")";  
        //         addPeriod = true;
        //     }

        //     // Add pages
        //     if(this.ref.pages){
        //         this.ref.citation += " " + this.ref.pages;  
        //         addPeriod = true;
        //     }

        //     if(addPeriod) this.ref.citation += ". "; 

        //     if(this.ref.doi) {
        //         this.ref.citation += "doi: " + this.ref.doi;
        //     }
        // }
    }

    setInputMethod(method:number) {
        // console.log("Method", method);
    }

    // to be deleted
    editAction(action: any, index: number) {
        switch ( action.command ) {
            case "Delete":
                this.removeAuthor(index);
                break;
            case "Add":
                this.newAuthor = action.value;
                this.addAuthor()
                break;
            case "Save":
                this.ref["authors"][index] = action.value;
                this.onChange(true);
                if(this.editingAuthorIndex == index)
                    this.editingAuthorIndex = -1;
                break;
            case "Edit":
                this.editingAuthorIndex = index;
                break;
            case "Undo":
                this.editingAuthorIndex = -1;
                break;                  
            default: 
                // 
                break;
        }

        this.forceReset = false;
    }

    // to be deleted
    removeAuthor(index: number) {
        if(this.editingAuthorIndex == index){ // Cancel editing
            this.ref["authors"][index] = this.originalRef["authors"][index];
        }else{ // Delete author
            this.ref.authors.splice(index, 1);
        }

        this.editingAuthorIndex = -1;
        this.onChange(true);
    }

    // to be deleted
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

    // to be deleted
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

    // to be deleted
    getEditIconClass(index: number) {
        if(this.editingAuthorIndex == index){
            return "faa faa-check";
        }else{
            return "faa faa-pencil";
        }
    }

    // to be deleted
    getDelIconClass(index: number) {
        if(this.editingAuthorIndex == index){
            return "faa faa-remove";
        }else{
            return "faa faa-trash";
        }
    }

    // to be deleted
    getDelButtonTooltip(index: number) {
        if(this.editingAuthorIndex == index){
            return "Cancel changes";
        }else{
            return "Remove this author";
        }
    }

    // to be deleted
    getEditButtonTooltip(index: number) {
        if(this.editingAuthorIndex == index){
            return "Save changes";
        }else{
            return "Edit this author";
        }
    }

    expandClick() {
        this.contentCollapsed = !this.contentCollapsed;

        if(this.contentCollapsed) {
            this.editBlockStatus = "collapsed";
        }else{
            this.editBlockStatus = "expanded";
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
