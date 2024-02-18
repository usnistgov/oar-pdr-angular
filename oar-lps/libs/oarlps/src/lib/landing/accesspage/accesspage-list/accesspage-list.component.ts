import { Component, OnInit, SimpleChanges, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../../../nerdm/nerdm';
import { Themes, ThemesPrefs } from '../../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../../shared/globals/globals';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AccessPage } from '../accessPage';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'lib-accesspage-list',
    templateUrl: './accesspage-list.component.html',
    styleUrls: ['../../landing.component.scss', './accesspage-list.component.css'],
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
export class AccesspageListComponent implements OnInit {
    accessPages: NerdmComp[] = [];
    scienceTheme = Themes.SCIENCE_THEME;
    currentOrderChanged: boolean = false;
    editBlockStatus: string = 'collapsed';
    placeholder: string = "Enter access page data below";
    fieldName: string = 'components';
    FieldNameAPI: string = 'pdr:see';
    orig_aPages: NerdmComp[] = null; // Keep a copy of original access pages for undo purpose
    orig_record: NerdmRes = null; // Keep a copy of original record for update purpose
    nonAccessPages: NerdmComp[] = []; // Keep a copy of original record for update purpose

    currentApageIndex: number = -1;
    currentApage: NerdmComp = {} as NerdmComp;
    editMode: string = MODE.NORNAL; 
    forceReset: boolean = false;

    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    @Input() record: NerdmRes = null;
    @Input() theme: string;
    @Output() dataCommand: EventEmitter<any> = new EventEmitter();

    constructor(public mdupdsvc : MetadataUpdateService,
                private notificationService: NotificationService,
                public lpService: LandingpageService,
                private sanitizer: DomSanitizer) { 

                this.lpService.watchEditing((sectionMode: SectionMode) => {
                    if( sectionMode ) {
                        if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                            if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                                if(this.currentApage && this.currentApage.dataChanged){
                                    this.saveCurApage(false);  // Do not refresh help text 
                                }

                                if(this.editBlockStatus == 'expanded')
                                    this.setMode(MODE.NORNAL);
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
        if (this.record && this.record[this.fieldName] && this.record[this.fieldName].length > 0){
            this.useMetadata();
        }
    }

    get isNormal() { return this.editMode==MODE.NORNAL || this.editMode==MODE.LIST }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isAdding() { return this.editMode==MODE.ADD }

    /**
     * Check if any access page data changed or access page order changed
     */
    get ApageDataChanged() {
        let changed: boolean = false;
        if(!this.accessPages || this.accessPages.length == 0) 
            return changed;

        for(let i=0; i < this.accessPages.length; i++) {
            changed = changed || this.accessPages[i].dataChanged;
        }

        return changed;
    }

    get updated() {
        return this.mdupdsvc.anyFieldUpdated(this.fieldName);        
    }

    /**
     * Hide this edit block
     * @param refreshHelp indicates if the help text needs be refreshed
     */
    // hideEditBlock(refreshHelp: boolean = true) {
    //     this.setMode(MODE.LIST, refreshHelp);

    //     if(this.record)
    //         this.dataCommand.next({"data": this.record[this.fieldName], "action": "listing"});
    // }

    ngOnChanges(ch : SimpleChanges) {
        if (ch.record){
            this.useMetadata();  // initialize internal component data based on metadata
        }
            
    }

    useMetadata(resetIndex: boolean = false) {
        //Keep a copy of the record for update purpose
        this.orig_record = JSON.parse(JSON.stringify(this.record));

        this.accessPages = [] as NerdmComp[];
        if (this.record[this.fieldName]) {
            this.accessPages = this.selectAccessPages();

            // if current page has not been set, set it
            if(this.currentApageIndex == -1 || this.currentApageIndex >= this.accessPages.length || resetIndex){
                this.currentApage = this.accessPages[0];
                if(this.currentApage)
                    this.currentApage.dataChanged = false;

                this.currentApageIndex = 0;
            }else{
                this.currentApage = this.accessPages[this.currentApageIndex];
            }

            //Keep a copy of the record for update purpose
            this.orig_aPages = JSON.parse(JSON.stringify(this.accessPages));

            //Keep a copy of the none access pages for update purpose
            let nonAPages = this.orig_record[this.fieldName].filter(cmp => {
                return !this.accessPages.find(ap => {
                    return ap['@id'] === cmp['@id'];
                });
            });
            this.nonAccessPages = JSON.parse(JSON.stringify(nonAPages));

            // If this is a science theme and the collection contains one or more components that contain both AccessPage (or SearchPage) and DynamicSourceSet, we want to remove it from accessPages array since it's already displayed in the search result.
            if(this.theme == this.scienceTheme) 
                this.accessPages = this.accessPages.filter(cmp => ! cmp['@type'].includes("nrda:DynamicResourceSet"));
        }
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
        // if(this.isAdding || this.isEditing) return;
        
        if(index != this.currentApageIndex) { // user selected different access page
            if(this.currentApage && this.currentApage.dataChanged) {
                this.updateMatadata(this.currentApage, this.currentApage["@id"]).then((success) => {
                    if(success){
                        this.setCurrentPage(index);
                        this.setMode(MODE.LIST);
                    }else{
                        let msg = "Update failed";
                        console.error(msg);
                    }
                })
            }else{
                this.setCurrentPage(index);
            }
        }
    }

    setCurrentPage(index: number){
        if(this.accessPages && this.accessPages.length > 0 && !this.isAdding){
            this.currentApageIndex = index;
            this.currentApage = this.accessPages[index];
            this.forceReset = (this.currentApageIndex != -1);
        }
    }
    /**
     * Handle actions from child component
     * @param action the action that the child component returned
     * @param index The index of the reference the action is taking place
     */
    onApageChange(action: any, index: number = 0) {
        switch ( action.command.toLowerCase() ) {
            case 'edit':
                this.selectApage(index);
                this.setMode(MODE.EDIT);
                break;
            case 'delete':
                this.removeAccessPage(index);
                break;
            case 'restore':
                this.mdupdsvc.undo(this.fieldName, this.record[this.fieldName][index]["@id"]).then((success) => {
                    if (success) {
                        this.currentApageIndex = 0;
                        this.currentApage = this.record[this.fieldName][this.currentApageIndex];
                        this.forceReset = true; // Force accesspage editor to reset data
                    } else {
                        let msg = "Failed to restore access pages"
                        console.error(msg);
                    }
                })

                break;
            default:
                break;
        }
    }

    /**
     * Remove reference and update the server
     * @param index Index of the reference to be deleted
     */
    removeAccessPage(index: number) {
        this.accessPages.splice(index,1);
        // this.currentOrderChanged = true;
        // this.dataCommand.next(MODE.EDIT);
        this.updateMatadata().then((success) => {
            if(success){
                this.setMode(MODE.LIST);
            }else{
                console.log("Update failed.")
            }
        });

        // If no access page available, update section help to display next steps 
        if(this.accessPages.length == 0){
            let sectionHelp: SectionHelp = {} as SectionHelp;
            sectionHelp.section = this.fieldName;
            sectionHelp.topic = HelpTopic[this.editMode];
    
            this.lpService.setSectionHelp(sectionHelp);
        }
    }

    /**
     * When access page data changed, set the flag so 
     */
    onDataChange(event) {
        this.accessPages[this.currentApageIndex] = JSON.parse(JSON.stringify(event.accessPage));
        this.accessPages[this.currentApageIndex].dataChanged = event.dataChanged;
    }

    /**
     * Handle commands from child component
     * @param cmd command from child component
     */
    onCommandChanged(cmd) {
        switch(cmd.command) {
            case 'saveCurrentPage':
                this.saveCurApage(true, MODE.LIST);
                break;
            case 'undoCurrentChanges':
                this.undoCurApageChanges();
                break;
            default:
                break;
        }
    }

    /**
     * Add an empty access page to the record and expand the edit window.
     */
    onAdd() {
        this.setMode(MODE.ADD);
    }

    /**
     * Cancel current changes
     */
    cancelEditing() {
        this.useMetadata();
        this.setMode();
        this.currentOrderChanged = false;
    }

    restoreOriginal() {
        this.editBlockStatus = 'collapsed';
        this.undoAllApageChanges();
    }


    saveListChanges(editmode: string = MODE.LIST, refreshHelp: boolean = true) {
        this.updateMatadata().then((success) => {
            if(success){
                this.setMode(MODE.LIST);
            }else{
                console.log("Update failed.")
            }
        });

        this.setMode(editmode, refreshHelp);
        this.currentOrderChanged = false;
    }

    /**
     * Save current access page
     */
    saveCurApage(refreshHelp: boolean = true, editmode: string = MODE.LIST) {
        let postMessage = {};
        this.record[this.fieldName] = JSON.parse(JSON.stringify([this.accessPages, this.nonAccessPages]));
        
        this.record[this.fieldName].dataChanged = false;

        postMessage[this.fieldName] = JSON.parse(JSON.stringify([...this.accessPages, ...this.nonAccessPages]));

        postMessage[this.fieldName].forEach(page => {
            delete page.showDesc;
            delete page.backcolor;
            delete page.dataChanged;
        })

        console.log('postMessage (body)', JSON.stringify(postMessage));
        
        if(this.isAdding){
            if(!this.emptyRecord(this.currentApageIndex)){
                this.mdupdsvc.add(postMessage, this.fieldName, this.FieldNameAPI).subscribe((rec) => {
                    if (rec){
                        this.record[this.fieldName] = JSON.parse(JSON.stringify(rec));
                        this.accessPages = this.selectAccessPages();
                        this.selectApage(this.accessPages.length - 1);

                        this.currentApage.dataChanged = false;
                        this.currentOrderChanged = false;
                        this.setMode(editmode, refreshHelp);
                    }else{
                        let msg = "Failed to add reference";
                        console.error(msg);
                        return;
                    }
                });
            }else{  //If no data has been entered, remove this reference
                this.removeAccessPage(this.currentApageIndex);
            }
        }else{
            this.updateMatadata(this.currentApage, this.currentApage["@id"]).then((success) => {
                if(success){
                    this.currentApage.dataChanged = false;
                    this.setMode(editmode, refreshHelp);
                }else{
                    console.log("Update failed.")
                }
            });
        }
    }

    /**
     * Update access pages. If given comp and compid, update only the given access page. 
     * Otherwise update all pages. After update, set the edit mode to editmode.
     * @param comp access page to update
     * @param compId access page id
     * @returns Observable (success or fail)
     */
    updateMatadata(comp: NerdmComp = undefined, compId: string = undefined) {
        let postMessage: any = {};

        return new Promise<boolean>((resolve, reject) => {
            if(compId && comp) {   // Update specific access page
                postMessage = JSON.parse(JSON.stringify(comp));
                delete postMessage.showDesc;
                delete postMessage.backcolor;
                delete postMessage.dataChanged;

                this.mdupdsvc.update(this.fieldName, postMessage, compId, this.FieldNameAPI).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess){
                        this.notificationService.showSuccessWithTimeout("Access page updated.", "", 3000);
                        // this.dataCommand.next(editmode);
                        resolve(true);
                    }else{
                        let msg = "Access page update failed.";
                        console.error(msg);
                        resolve(false);
                    }
                });
            }else{  // Update all access page
                postMessage[this.fieldName] = [];

                if(this.accessPages.length > 0 || this.nonAccessPages.length > 0) {
                    this.record[this.fieldName] = JSON.parse(JSON.stringify([this.accessPages, this.nonAccessPages]));
                    postMessage[this.fieldName] = JSON.parse(JSON.stringify([...this.accessPages, ...this.nonAccessPages]));
                }

                // let pm = postMessage.length > 0 ? postMessage : {};

                this.mdupdsvc.update(this.fieldName, postMessage, undefined, this.FieldNameAPI).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess){
                        this.notificationService.showSuccessWithTimeout("Access page updated.", "", 3000);
                        // this.dataCommand.next(editmode);
                        resolve(true);
                    }else{
                        let msg = "Access page update failed.";
                        console.error(msg);
                        resolve(false);
                    }
                });
            }
        })
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

                // if(refreshHelp){
                //     this.refreshHelpText(MODE.LIST);
                // }
                break;
            case MODE.EDIT:
                this.openEditBlock();

                // Update help text
                // if(refreshHelp){
                //     this.refreshHelpText(MODE.EDIT);
                // }
                break;
            case MODE.ADD:
                //Append a blank access page to the record and set current access page.
                if(!this.accessPages || this.accessPages.length == 0){
                    this.accessPages = [];
                }

                let newAccessPage = {} as NerdmComp;
                newAccessPage["@type"] = ['nrdp:AccessPage'];
                newAccessPage["isNew"] = true;
                this.accessPages.push(newAccessPage);
                
                this.currentApageIndex = this.accessPages.length - 1;
                this.accessPages[this.currentApageIndex].dataChanged = true;
                this.currentApage = this.accessPages[this.currentApageIndex];

                this.openEditBlock();

                // Update help text
                // if(refreshHelp){
                //     this.refreshHelpText(MODE.ADD);
                // }                
                break;
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'

                // Update help text
                // if(refreshHelp){
                //     this.refreshHelpText(MODE.NORNAL);
                // }                
                break;
        }

        //Broadcast the current section and mode
        this.dataCommand.next(editmode);

        // Update help text
        if(refreshHelp){
            this.refreshHelpText(editmode);
        }  

        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }
   
    /**
     * Get the background color of the whole record for list mode
     * We do not keep track of individual page status here because in list mode,
     * individual page's changes must have been saved or discarded.
     * @returns 
     * Yellow - if order changed.
     * Green - if data changed and saved.
     */
    getRecordBackgroundColor() {
        if(this.updated){
            return 'var(--data-changed-saved)';
        }else{
            return 'var(--editable)';
        }
    }

    /**
     * 
     * @param index index of the active access page
     * @returns 
     */
    getActiveApageStyle(index: number) {
        if(index == this.currentApageIndex) {
            return { 'background-color': this.getApageBackgroundColor(index), 'border': '1px solid var(--active-item)'};
        } else {
            return {'background-color': this.getApageBackgroundColor(index), 'border':'1px solid var(--background-light-grey)'};
        }
    }

    /**
     * Get the background color of a specific access page
     * @param index index number of the access page
     * @returns 
     */
    getApageBackgroundColor(index: number){
        if(!this.accessPages[index]){
            return 'white';
        }else if(this.accessPages[index].dataChanged){
            return 'var(--data-changed)';
        }else if(this.mdupdsvc.fieldUpdated(this.fieldName, this.accessPages[index]['@id'])){
            return 'var(--data-changed-saved)';
        }else{
            return 'white';
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
            return "fas fa-plus fa-sm icon_enabled";
        }else{
            return "fas fa-plus fa-sm icon_disabled";
        }
    }

    /**
     * Determine icon class of edit button
     * If edit mode is normal, display edit icon.
     * Otherwise display check icon.
     * @returns edit button icon class
     */   
    editIconClass() {
        if(this.isNormal && this.accessPages.length > 0){
            return "fas fa-pencil icon_enabled";
        }else{
            return "fas fa-pencil icon_disabled";
        }
    }

   /**
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
   undoAllApageChanges() {
        // this.record = JSON.parse(JSON.stringify(this.orig_record));
        // this.useMetadata();

        if(this.updated){
            this.mdupdsvc.undo(this.fieldName).then((success) => {
                if (success){
                    this.useMetadata(true);
                    // this.accessPages.forEach((apage) => {
                    //     apage.dataChanged = false;
                    // });

                    this.setMode(MODE.NORNAL);
                    this.notificationService.showSuccessWithTimeout("Reverted changes to " + this.fieldName + ".", "", 3000);
                }else{
                    let msg = "Failed to undo " + this.fieldName + " metadata";
                    console.error(msg);
                    return;
                }
            });
        }
    }

    openEditBlock() {
        this.editBlockStatus = 'expanded';
        this.lpService.setCurrentSection("dataAccess");
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
        // this.currentOrderChanged = true;
        // this.dataCommand.next("editing");
        this.saveListChanges();

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }

    /**
     * Revert current access page to original
     */
    undoCurApageChanges() {
        if(this.currentApage && this.currentApage.dataChanged) {
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
                this.mdupdsvc.loadSavedSubsetFromMemory(this.fieldName, this.currentApage["@id"]).subscribe(
                    (aPage) => {
                        let index = this.record[this.fieldName].findIndex((comp) => comp['@id'] == this.currentApage['@id']);
                        
                        if(index > -1){
                            this.record[this.fieldName][index] = JSON.parse(JSON.stringify(aPage));
                            this.currentApageIndex = index;
                            this.currentApage = JSON.parse(JSON.stringify(aPage));
                            this.currentApage.dataChanged = false;
                        }else{
                            //This should never happen
                        }
                        
                        this.useMetadata();
                    }
                )             
            }

        }
        this.setMode(MODE.LIST);
    }


    emptyRecord(index: number): boolean {
        return !this.accessPages[index] && !(this.accessPages[index].title || this.accessPages[index].description || this.accessPages[index].accessURL);
    }
}
