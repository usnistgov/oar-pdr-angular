import { Component, OnInit, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../nerdm/nerdm';
import { Themes, ThemesPrefs } from '../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { LandingpageService } from '../landingpage.service';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AccessPage } from './accessPage';

@Component({
    selector: 'lib-accesspage',
    templateUrl: './accesspage.component.html',
    styleUrls: ['../landing.component.css', './accesspage.component.css'],
    animations: [
        trigger('enterAnimation', [
        state('enter', style({height: '0px', opacity: 0})),
        state('leave', style({height: '*', opacity: 1})),
        transition('enter <=> leave', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('editExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class AccesspageComponent implements OnInit {
    accessPages: NerdmComp[] = [];
    scienceTheme = Themes.SCIENCE_THEME;
    dataChanged: boolean = false;
    editBlockStatus: string = 'collapsed';
    fieldName: string = 'components';
    orig_record: NerdmRes = null; // Keep a copy of original record for undo purpose

    currentApageIndex: number = 0;
    currentApage: NerdmComp = {} as NerdmComp;
    editMode: string = "normal"; 

    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    @Input() record: NerdmRes = null;
    @Input() theme: string;

    constructor(public mdupdsvc : MetadataUpdateService,
                private notificationService: NotificationService,
                public lpService: LandingpageService) { 

        this.lpService.watchEditing((section) => {
            if(section != "" && section != this.fieldName && this.dataChanged) {
                this.onSave();
            }
        })
    }

    ngOnInit(): void {
        if (this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0){
            this.useMetadata();
            //Keep a copy of the record for undo purpose
            this.orig_record = JSON.parse(JSON.stringify(this.record));
        }
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get isNormal() { return this.editMode=="normal" }
    get isEditing() { return this.editMode=="edit" }
    get isAdding() { return this.editMode=="add" }

    startEditing() {
        // If is editing, save data to the draft server
        if(this.isEditing || this.isAdding){
            this.onSave();
            this.setStatus("normal");
        }else{ // If not editing, enter edit mode
            this.setStatus("edit");
        }
    }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record)
            this.useMetadata();  // initialize internal component data based on metadata
    }

    useMetadata() {
        this.accessPages = [];
        if (this.record['components']) {
            this.accessPages = this.selectAccessPages();

            // If this is a science theme and the collection contains one or more components that contain both AccessPage (or SearchPage) and DynamicSourceSet, we want to remove it from accessPages array since it's already displayed in the search result.
            if(this.theme == this.scienceTheme) 
                this.accessPages = this.accessPages.filter(cmp => ! cmp['@type'].includes("nrda:DynamicResourceSet"));
        }

        console.log("this.accessPages", this.accessPages);
    }

    /**
     * select the AccessPage components to display, adding special disply options
     */
    selectAccessPages() : NerdmComp[] {
        let use: NerdmComp[] = (new NERDResource(this.record)).selectAccessPages();
        use = (JSON.parse(JSON.stringify(use))) as NerdmComp[];

        return use.map((cmp) => {
            if (! cmp['title']) cmp['title'] = cmp['accessURL'];

            cmp['showDesc'] = false;
            cmp['backcolor'] = 'white';

            return cmp;
        });
    }

    /**
     * When reference data changed, set the flag so 
     */
    onDataChange(event) {
        this.dataChanged = event.dataChanged;
    }

    onSave() {
        this.editBlockStatus = 'collapsed';
        this.updateMatadata();
        this.setStatus("normal");
    }

    onCancel() {
        this.editBlockStatus = 'collapsed';
        this.undoEditing();
    }

    updateMatadata() {
        if(this.dataChanged){
            let updmd = {};
            updmd[this.fieldName] = this.record[this.fieldName];
            this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                if (updateSuccess){
                    this.notificationService.showSuccessWithTimeout("Access page updated.", "", 3000);
                }else
                    console.error("acknowledge access page update failure");
            });
        }
    }

    getBackgroundColor(index: number){
        if(this.record[this.fieldName][index].dataChanged){
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

    getActiveItemStyle(index: number) {
        if(index == this.currentApageIndex) {
            return { 'border': '1px solid #33ccff'};
        } else {
            return {'background-color': this.getBackgroundColor(index), 'border':'var(--background-light-grey)'};
        }
    }

    /**
     * Determine icon class of add button
     * If edit mode is normal, display enabled icon.
     * Otherwise display disabled icon.
     * @returns add button icon class
     */    
    addIconClass() {
        if(this.isNormal){
            return "faa faa-plus icon_enabled";
        }else{
            return "faa faa-plus icon_disabled";
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
            return "faa faa-pencil icon_enabled";
        }else{
            return "faa faa-check icon_enabled";
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
        this.currentApageIndex = 0;
        this.currentApage = this.record.references[this.currentApageIndex];
        this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
        this.setStatus("normal");
    }

    setStatus(editStatus: string = "normal") {
        this.editMode = editStatus;
        switch ( this.editMode ) {
            case "edit":
                this.openEditBlock();
                //Tell the system who is editing
                this.lpService.setEditing(this.fieldName);
                break;
            case "add":
                this.record.components.unshift({} as NerdmComp);
                this.currentApageIndex = 0;
                this.currentApage = this.record[this.fieldName][0];
                this.openEditBlock();
                this.dataChanged = true;
                break;
            default: // normal
                this.editBlockStatus = 'collapsed'
                //Tell the system nobody is editing so system can display general help text
                this.lpService.setEditing("");
                break;
        }
    }

    openEditBlock() {
        this.editBlockStatus = 'expanded';
        this.lpService.setCurrentSection("dataAccess");
    }

    /**
     * Determine icon class of undo button
     * If edit mode is normal, display disabled icon.
     * Otherwise display enabled icon.
     * @returns undo button icon class
     */
    undoIconClass() {
        if(this.isNormal){
            return "faa faa-undo icon_disabled";
        }else{
            return "faa faa-undo icon_enabled";
        }
    }

    // Drag drop functions
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
        this.currentApageIndex = event.item.data;
        this.currentApage = this.accessPages[this.currentApageIndex];
        this.dataChanged = true;
        // this.setStatus(true);

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }
}
