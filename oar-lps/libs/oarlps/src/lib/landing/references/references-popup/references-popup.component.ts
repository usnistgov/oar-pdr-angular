import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { deepCopy } from '../../../config/config.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
  } from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-references-popup',
  templateUrl: './references-popup.component.html',
  styleUrls: ['./references-popup.component.css']
})
export class ReferencesPopupComponent implements OnInit {
    @ViewChild('dropListContainer') dropListContainer?: ElementRef;
    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
      dragIndex: number;
      dropIndex: number;
    };

    originalReferences: any;
    public items: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    @Input() inputValue: any;
    @Input() field: string;
    @Input() title?: string = "";
    @Output() returnValue: EventEmitter<any> = new EventEmitter();  

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        console.log("inputValue", this.inputValue);
        if (this.inputValue != undefined)
            this.originalReferences = deepCopy(this.inputValue);
        else
            this.inputValue = {};
    }

    /*
    *   Save references and close popup dialog
    */
    saveReferences() {
        this.returnValue.emit(this.inputValue);
        this.activeModal.close('Close click')
    }

    addReference() {
        this.inputValue.push("");
    }

    onTitleChange(reference: any, value) {
        console.log("reference", reference);
        console.log("value", value);
    }

    getRefClass() {

    }

    handleRefDisplay() {
        
    }

    add() {
      this.items.push(this.items.length + 1);
    }
  
    shuffle() {
      this.items.sort(function () {
        return 0.5 - Math.random();
      });
    }
  
    dragEntered(event: CdkDragEnter<number>) {
      const drag = event.item;
      const dropList = event.container;
      const dragIndex = drag.data;
      const dropIndex = dropList.data;
  
      this.dragDropInfo = { dragIndex, dropIndex };
      console.log('dragEntered', { dragIndex, dropIndex });
  
      const phContainer = dropList.element.nativeElement;
      const phElement = phContainer.querySelector('.cdk-drag-placeholder');
  
      if (phElement) {
        phContainer.removeChild(phElement);
        phContainer.parentElement?.insertBefore(phElement, phContainer);
  
        moveItemInArray(this.items, dragIndex, dropIndex);
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
  
      this.dropListReceiverElement.style.removeProperty('display');
      this.dropListReceiverElement = undefined;
      this.dragDropInfo = undefined;
    }
}
