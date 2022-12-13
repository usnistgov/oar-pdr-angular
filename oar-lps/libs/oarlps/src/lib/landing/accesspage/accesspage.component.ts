import { Component, OnInit, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../nerdm/nerdm';
import { Themes, ThemesPrefs } from '../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { LandingpageService, SectionMode, MODE } from '../landingpage.service';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AccessPage } from './accessPage';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'lib-accesspage',
    templateUrl: './accesspage.component.html',
    styleUrls: ['../landing.component.scss', './accesspage.component.css'],
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
    orderChanged: boolean = false;
    editBlockStatus: string = 'collapsed';
    fieldName: string = 'components';
    orig_aPages: NerdmComp[] = null; // Keep a copy of original access pages for undo purpose
    orig_record: NerdmRes = null; // Keep a copy of original record for update purpose
    nonAccessPages: NerdmComp[] = []; // Keep a copy of original record for update purpose

    currentApageIndex: number = 0;
    currentApage: NerdmComp = {} as NerdmComp;
    editMode: string = "normal"; 
    forceReset: boolean = false;

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
                public lpService: LandingpageService,
                private sanitizer: DomSanitizer) { 

                this.lpService.watchEditing((sectionMode: SectionMode) => {
                    console.log("Section mode", sectionMode);
                    if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                        if(this.dataChanged){
                            this.onSave();
                        }
    
                        this.setMode(MODE.NORNAL);
                    }
                })
    }

    ngOnInit(): void {
        if (this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0){
            this.useMetadata();
        }
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get isNormal() { return this.editMode=="normal" }
    get isEditing() { return this.editMode=="edit" }
    get isAdding() { return this.editMode=="add" }

    /**
     * Check if any access page data changed or access page order changed
     */
    get dataChanged() {
        let changed: boolean = false;
        if(!this.accessPages || this.accessPages.length == 0) return this.orderChanged;
        for(let i=0; i < this.accessPages.length; i++) {
            changed = changed || this.accessPages[i].dataChanged;
        }

        return changed || this.orderChanged;
    }

    startEditing() {
        // If is editing, save data to the draft server
        if(this.isEditing || this.isAdding){
            this.onSave();
            this.setMode(MODE.NORNAL);
        }else{ // If not editing, enter edit mode
            this.setMode(MODE.EDIT);
        }
    }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record)
            this.useMetadata();  // initialize internal component data based on metadata
    }

    useMetadata() {
        //Keep a copy of the record for update purpose
        this.orig_record = JSON.parse(JSON.stringify(this.record));

        this.accessPages = [] as NerdmComp[];
        if (this.record[this.fieldName]) {
            this.accessPages = this.selectAccessPages();
            this.selectApage(0);

            //Keep a copy of the record for update purpose
            this.orig_aPages = JSON.parse(JSON.stringify(this.accessPages));

            //Keep a copy of the none access pages for update purpose
            let nonAPages = this.orig_record[this.fieldName].filter(cmp => {
                return !this.accessPages.find(ap => {
                    return ap['@id'] === cmp['@id'];
                });
            });
            
            this.nonAccessPages = JSON.parse(JSON.stringify(nonAPages));
            console.log('this.nonAccessPages', this.nonAccessPages);

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
     * Set current access page to the selected one
     * @param index The index of the selected access page
     */
    selectApage(index: number) {
        if(this.accessPages && this.accessPages.length > 0 && !this.isAdding){
            this.forceReset = (this.currentApageIndex != -1);

            this.currentApageIndex = index;
            this.currentApage = this.accessPages[index];
        }
    }

    /**
     * When access page data changed, set the flag so 
     */
    onDataChange(event) {
        this.accessPages[this.currentApageIndex] = event.accessPage;
        this.accessPages[this.currentApageIndex].dataChanged = event.dataChanged;
    }

    /**
     * Add an empty access page to the record and expand the edit window.
     */
    onAdd() {
        this.setMode(MODE.ADD);
    }

    onSave() {
        this.editBlockStatus = 'collapsed';
        this.updateMatadata();
        this.setMode(MODE.NORNAL);
    }

    onCancel() {
        this.editBlockStatus = 'collapsed';
        this.undoAllApageChanges();
    }

    updateMatadata() {
        if(this.dataChanged){
            let updmd = {};
            this.record[this.fieldName] = [this.accessPages, this.nonAccessPages];
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

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = "normal") {
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
                //Append a blank access page to the record and set current access page.
                if(!this.accessPages || this.accessPages.length == 0){
                    this.accessPages = [];
                }

                this.accessPages.push({} as NerdmComp);
                
                this.currentApageIndex = this.accessPages.length - 1;
                this.accessPages[this.currentApageIndex].dataChanged = true;
                this.currentApage = this.accessPages[this.currentApageIndex];
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
            return "faa faa-pencil icon_disabled";
        }
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoAllApageChanges() {
        this.record = JSON.parse(JSON.stringify(this.orig_record));
        this.useMetadata();

        if(this.updated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    this.accessPages.forEach((apage) => {
                        apage.dataChanged = false;
                    });

                }else
                    console.error("Failed to undo " + this.fieldName + " metadata");
                    return;
            });
        }

        this.orderChanged = false;
        this.currentApageIndex = 0;
        this.currentApage = this.accessPages[this.currentApageIndex];
        this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
        this.setMode(MODE.NORNAL);
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
        return this.dataChanged || this.isEditing? "faa faa-undo icon_enabled" : "faa faa-undo icon_disabled";
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
    
          moveItemInArray(this.accessPages, dragIndex, dropIndex);
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
        this.orderChanged = true;

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }

    /**
     * Revert current access page to original
     */
     undoCurApageChanges() {
        if(this.currentApage.dataChanged) {
            if(this.isAdding) {
                if(this.accessPages.length == 1) {
                    this.accessPages = [] as NerdmComp[];
                    this.currentApageIndex = 0;
                }else {
                    this.accessPages.splice(this.currentApageIndex, 1);
                    this.currentApageIndex = 0;
                    this.currentApage = this.accessPages[this.currentApageIndex];
                }
            }else{
                let orig_aPage = this.orig_aPages.find(ap => ap['@id'] === this.currentApage['@id']);
                if(orig_aPage){
                    this.currentApage = JSON.parse(JSON.stringify(orig_aPage));
                    this.accessPages[this.currentApageIndex] = this.currentApage;
                }else{
                    // This should never happen
                    console.log("Unable to locate original access page record");
                }
                
                this.currentApage.dataChanged = false;
            }

        }
        this.setMode(MODE.NORNAL);
    }

    /**
     * Save current access page
     */
    saveCurApage() {
        this.updateMatadata();
        this.setMode(MODE.NORNAL);
    }
}
