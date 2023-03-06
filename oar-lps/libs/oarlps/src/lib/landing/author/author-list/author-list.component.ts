import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LandingpageService, SectionMode, MODE, SectionHelp, HelpTopic } from '../../landingpage.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { Author } from '../author';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragMove,
    moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'lib-author-list',
    templateUrl: './author-list.component.html',
    styleUrls: ['../../landing.component.scss', './author-list.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class AuthorListComponent implements OnInit {
    // editingAuthorIndex: number = -1; // Indicating which author is being edited
    currentAuthorIndex: number = 0;
    currentAuthor: Author; // for drag drop
    // currentEditingAuthor: Author // for editing
    originalRecord: any = {};
    // forceReset: boolean = false;
    newAuthor: Author = {} as Author;
    fieldName = 'authors';
    placeholder: string = "Enter author data below";
    editBlockStatus: string = 'collapsed';
    orderChanged: boolean = false;

    // "add", "edit" or "normal" mode. In edit mode, "How would you enter author data?" will not display.
    // Default is "normal" mode.
    editMode: string = MODE.NORNAL; 

    @Input() record: any[];
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    
    //Drag and drop
    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    dropListReceiverElement?: HTMLElement;
    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    constructor(public mdupdsvc : MetadataUpdateService,
                private notificationService: NotificationService,
                public lpService: LandingpageService) { 

                this.lpService.watchEditing((sectionMode: SectionMode) => {
                    if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                        if(this.isEditing && this.currentAuthor.dataChanged){
                            this.saveCurrentAuthor(false); // Do not refresh help text 
                        }
                        this.hideEditBlock(false);
                    }
                })
    }

    ngOnInit(): void {
        this.updateOriginal();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            // this.editingAuthorIndex = -1;
            this.updateOriginal();
        }

        if(changes.forceReset){
            this.orderChanged = false;
        }
    }

    get isNormal() { return this.editMode==MODE.NORNAL }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isAdding() { return this.editMode==MODE.ADD }

    /**
     * Check if any author data changed or author order changed
     */
    get authorsChanged() {
        let changed: boolean = false;

        if(this.record[this.fieldName]) {
            this.record[this.fieldName].forEach(author => {
                changed = changed || author.dataChanged;
            })
        }
        
        return changed || this.orderChanged;
    }

    get authorsUpdated() {
        return this.mdupdsvc.anyFieldUpdated(this.fieldName);
    }

    // Background color of the text edit area
    get editAreabackgroundColor() {
        let bkColor = 'white';

        if(this.currentAuthor) {
            if(this.mdupdsvc.fieldUpdated(this.fieldName, this.currentAuthor["@id"])){
                bkColor = 'var(--data-changed-saved)';
            }else if(this.currentAuthor.dataChanged){
                bkColor = 'var(--data-changed)';
            }
        }

        return bkColor;
    }

    authorUpdated(index: number) {
        return this.mdupdsvc.fieldUpdated(this.fieldName, this.record[this.fieldName][index]['@id']);
    }    

    getAuthorName(index: number) {
        if(!this.record || !this.record[this.fieldName] || this.record[this.fieldName].length == 0) return "";

        if(this.record[this.fieldName][index].fn) return this.record[this.fieldName][index].fn;

        if(this.record[this.fieldName][index].givenName && this.record[this.fieldName][index].familyName)  
            return this.record[this.fieldName][index].givenName + " " + this.record[this.fieldName][index].familyName;

        if(this.record[this.fieldName][index].familyName)  
            return this.record[this.fieldName][index].familyName;

        if(this.record[this.fieldName][index].givenName)  
            return this.record[this.fieldName][index].givenName;

        return "";
    }

    /**
     * Update originalAuthors for unde purpose
     */
    updateOriginal() {
        if(this.record[this.fieldName]) {
            if(this.record[this.fieldName].length < 1) {
                this.currentAuthorIndex = -1;
                this.currentAuthor = {} as Author;
            }else if(this.currentAuthorIndex >= this.record[this.fieldName].length){
                this.currentAuthorIndex = 0;
                this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
            }else{
                this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
            }
            
            this.originalRecord[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        }else{
            this.currentAuthorIndex = -1;
            this.currentAuthor = {} as Author;
        }
    }

    /**
     * Once author info changed, update parent component
     * @param updateCitation 
     */
    onOrderChange() {
        this.updateMatadata().then((success) => {
            if(success){
                this.orderChanged = true;
            }else{
                console.error("Update failed")
            }
        });
    }

    /**
     * When author data changed (child component), set the flag in record level.
     * Also update the author data. 
     */
    onAuthorChange(event) {
        this.record[this.fieldName][this.currentAuthorIndex] = JSON.parse(JSON.stringify(event.author));
        this.record[this.fieldName][this.currentAuthorIndex].dataChanged = event.dataChanged;
        this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
    }

    onAdd() {
        this.setMode(MODE.ADD);
    }

    onEdit(index) {
        this.currentAuthor = JSON.parse(JSON.stringify(this.record[this.fieldName][index]));
        setTimeout(() => {
            this.setMode(MODE.EDIT);
        }, 0);
    }

    /**
     * Save current author to the server
     */    
    saveCurrentAuthor(refreshHelp: boolean = true) {
        if(this.currentAuthor.dataChanged){
            this.updateMatadata(this.currentAuthor, this.currentAuthor['@id']).then((success) => {
                if(success){
                    this.setMode(MODE.NORNAL, refreshHelp);
                }else{
                    console.error("Update failed")
                }
            })
        }else{
            this.setMode(MODE.NORNAL, refreshHelp);
        }
    }

    /**
     * Save authors to the server
     */
    saveAuthors() {
        this.editBlockStatus = 'collapsed';
    }

    /**
     * Update author data to the server
     */
    updateMatadata(author: Author = undefined, id: string = undefined) {
        let lAuthors = [];
        var postMessage: any = {};

        return new Promise<boolean>((resolve, reject) => {
            // Only update certain author
            if(id) {
                let foundAuthor = this.record[this.fieldName].find(element => element['@id'].trim() == id.trim());
                if(foundAuthor) {
                    foundAuthor = JSON.parse(JSON.stringify(author));

                    this.mdupdsvc.update(this.fieldName, foundAuthor, id).then((updateSuccess) => {
                        // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                        if (updateSuccess){
                            this.notificationService.showSuccessWithTimeout("Author updated.", "", 3000);
                            resolve(true);
                        }else
                            console.error("acknowledge author update failure");
                            resolve(true);
                    });
                }else{
                    console.error("Author not found", author['@id']);
                }
            }else{  // Update all authors
                postMessage[this.fieldName] = [];
                this.record[this.fieldName].forEach(author => {
                    postMessage[this.fieldName].push(JSON.parse(JSON.stringify(author)))
                });

                this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess){
                        this.notificationService.showSuccessWithTimeout("Authors updated.", "", 3000);
                        resolve(true);
                    }else{
                        console.error("acknowledge authors update failure");
                        resolve(false);
                    }
                });
            }
        })
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoAllChanges() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.setMode();
                this.orderChanged = false;
                this.forceReset = true;
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            }else{
                console.error("Failed to undo keywords metadata");    
            }
                
        });
    }

    undoCurAuthorChanges() {
        if(this.isAdding) {
            this.removeAuthor(this.currentAuthorIndex);
        }else{
            this.record[this.fieldName][this.currentAuthorIndex] = JSON.parse(JSON.stringify(this.originalRecord[this.fieldName][this.currentAuthorIndex]));
        }

        this.editBlockStatus = 'collapsed';
        this.editMode = MODE.NORNAL;
    }

    hideEditBlock(refreshHelp: boolean = true) {
        this.setMode(MODE.NORNAL, refreshHelp);

        if(this.record)
            this.dataChanged.next({"authors": this.record[this.fieldName], "action": "hideEditBlock"});
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
     * Determine icon class of undo button
     * If edit mode is normal, display disabled icon.
     * Otherwise display enabled icon.
     * @returns undo button icon class
     */
    undoIconClass() {
        return !this.authorsChanged && !this.authorsUpdated? "faa faa-undo icon_disabled" : "faa faa-undo icon_enabled";
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

    // editAction(action: any, index: number = 0) {
    //     switch ( action.command.toLowerCase() ) {
    //         case "delete":
    //             this.removeAuthor(index);
    //             break;

    //         case "undo":
    //             this.editingAuthorIndex = -1;
    //             break;                  

    //         default: 
    //             // 
    //             break;
    //     }

    //     this.forceReset = false;
    // }

    removeAuthor(index: number) {
        this.record[this.fieldName].splice(index, 1);

        if(this.record[this.fieldName].length <= 0){
            this.currentAuthorIndex = -1;
            this.currentAuthor = {} as Author;
            // this.editingAuthorIndex = -1;
        }else{
            this.currentAuthorIndex = 0;
            this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
            // this.editingAuthorIndex = 0;
        }

        if(!this.isAdding)
            this.updateMatadata();
    }

    /**
     * Return background color of the given author based on dataChanged flag of the author
     * @param index The index of the target author
     * @returns background color
     */
    getBackgroundColor(index: number){
        let bkColor = 'white';

        if(this.mdupdsvc.fieldUpdated(this.fieldName, this.record[this.fieldName][index]["@id"])){
            bkColor = 'var(--data-changed-saved)';
        }else if(this.record[this.fieldName][index].dataChanged){
            bkColor = 'var(--data-changed)';
        }

        return bkColor;
    }
   
    /**
     * Retuen background color of the whole record (the container of all authors) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    getRecordBackgroundColor() {
        let bkColor = 'var(--editable)';

        if(this.authorsUpdated){
            bkColor = 'var(--data-changed-saved)';
        }else if(this.authorsChanged){
            bkColor = 'var(--data-changed)';
        }

        return bkColor;
    }

    /**
     * Return the style class of a given author:
     * If this is the active author, set border color to blue. Otherwise set border color to grey.
     * If this author's data changed, set background color to yellow. Otherwise set to white.
     * @param index The index of the active author
     * @returns 
     */
    getActiveItemStyle(index: number) {
        if(index == this.currentAuthorIndex) {
            // return { 'background-color': 'var(--background-light-grey)'};
            return { 'background-color': this.getBackgroundColor(index), 'border': '1px solid var(--active-item)'};
        } else {
            return {'background-color': this.getBackgroundColor(index), 'border':'1px solid var(--background-light-grey)'};
        }
    }

    /**
     * Set current author to the selected one
     * @param index The index of the selected author
     */
    selectAuthor(index: number) {
        if(index != this.currentAuthorIndex) { // user selected different author
            // If current author changed but not updated to the server, update first
            if(this.currentAuthor["dataChanged"] && !this.authorUpdated(this.currentAuthorIndex)) {
                this.updateMatadata(this.currentAuthor, this.currentAuthor['@id']).then((success) => {
                    if(success){
                        this.setCurrentAuthor(index);

                        if(this.editMode==MODE.ADD || this.editMode==MODE.EDIT)
                            this.editMode = MODE.EDIT;
                        else    
                            this.editMode = MODE.NORNAL;
                    }else{
                        console.error("Update failed")
                    }
                })
            }else{
                this.setCurrentAuthor(index);
            }
        }

        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic['dragdrop'];

        this.lpService.setSectionHelp(sectionHelp);
    }

    setCurrentAuthor(index: number){
        if(this.record[this.fieldName] && this.record[this.fieldName].length > 0 && !this.isAdding){
            this.forceReset = (this.currentAuthorIndex != -1);

            this.currentAuthorIndex = index;
            this.currentAuthor = this.record[this.fieldName][index];
        }
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];

        if(refreshHelp){
            this.lpService.setSectionHelp(sectionHelp);
        }
            
        switch ( this.editMode ) {
            case MODE.EDIT:
                this.openEditBlock();
                break;
            case MODE.ADD:
                //Append a blank author to the record and set current author.
                if(!this.record[this.fieldName]){
                    this.record[this.fieldName] = [];
                }

                let newAuthor: Author = {} as Author;
                newAuthor["isNew"] = true;
                newAuthor["familyName"] = "";
                newAuthor["givenName"] = "";
                newAuthor["fn"] = "";

                this.record[this.fieldName].push(newAuthor);
                
                this.currentAuthorIndex = this.record[this.fieldName].length - 1;

                this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
                this.currentAuthor.dataChanged = true;
                // this.orderChanged = true;

                this.openEditBlock();
                break;
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed';
                this.hideEditBlock();
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    /**
     * Expand the edit block that user can edit author data
     */
    openEditBlock() {
        this.editBlockStatus = 'expanded';
        //Broadcast current edit section so landing page will scroll to the section
        this.lpService.setCurrentSection(this.fieldName);
    }

    /**
     * Handle actions from drag-drop component
     * @param action the action that the child component returned
     * @param index The index of the author the action is taking place
     */
    onAuthorCommand(action: any, index: number = 0) {
        switch ( action.command.toLowerCase() ) {
            case 'edit':
                this.onEdit(index);
                break;
            case 'delete':
                this.removeAuthor(index);
                break;    
            case 'restore':
                this.mdupdsvc.undo(this.fieldName, this.record[this.fieldName][index]['@id']).then((success) => {
                    if (success) {
                        this.record[this.fieldName][index]['dataChanged'] = false;
                        // this.currentAuthorIndex = 0;
                        // this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
                        this.forceReset = true; // Force author editor to reset data
                    } else {
                        console.error("Failed to restore authors");
                    }
                })

                break;
            default:
                break;
        }
    }

    onAutherChange(event) {
        this.record[this.fieldName][this.currentAuthorIndex] = JSON.parse(JSON.stringify(event.author));
        this.record[this.fieldName][this.currentAuthorIndex].dataChanged = event.dataChanged;
        this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
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
    
            moveItemInArray(this.record[this.fieldName], dragIndex, dropIndex);
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

        this.onOrderChange();

        this.currentAuthorIndex = event.item.data;
        this.currentAuthor = this.record[this.fieldName][this.currentAuthorIndex];
        // this.dataChanged.next({"authors": this.record[this.fieldName], "action": "dataChanged"});

        this.dropListReceiverElement.style.removeProperty('display');
        this.dropListReceiverElement = undefined;
        this.dragDropInfo = undefined;
    }
}
