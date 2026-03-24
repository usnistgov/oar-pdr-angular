import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService, iconClass, Collections } from '../../../shared/globals/globals';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { IspartofPubComponent } from '../ispartof-pub/ispartof-pub.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faPencil,
    faXmark,
    faSave,
    faUndo
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'ispartof-edit',
    standalone: true,
    imports: [
            CommonModule,
            // ButtonModule,
            // TooltipModule,
            NgbModule,
            IspartofPubComponent,
            FontAwesomeModule
    ],
    templateUrl: './ispartof-edit.component.html',
    styleUrls: ['../../landing.component.scss', './ispartof-edit.component.css'],
        animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class IspartofEditComponent {
    isPartOf: string[] = null;
    dataChanged: boolean = false;
    isEditing: boolean = false;
    fieldName = SectionPrefs.getFieldName(Sections.ISPARTOF);
    editBlockStatus: string = 'collapsed';
    editMode: string = MODE.NORMAL; 
    overflowStyle: string = 'hidden';
    selectedCollection: string = "None"; // currently selected collection
    savedCollection: string = "None"; // currently saved collection
    collectionHistory: string[] = []; // history of selected collections for undo purposes
    originalCollection: string = null;
    globalsvc = inject(GlobalService);

    //Collection data
    collectionOrder: string[] = [Collections.DEFAULT];
    allCollections: any = {};

    collectionData = [];

    //icon class
    editIcon = iconClass.EDIT;
    closeIcon = iconClass.CLOSE;
    saveIcon = iconClass.SAVE;
    cancelIcon = iconClass.CANCEL;
    undoIcon = iconClass.UNDO;

    @Input() record: any[];
    @Input() inBrowser: boolean; 
    @Input() isEditMode: boolean;

    constructor(
        public mdupdsvc : MetadataUpdateService, 
        private chref: ChangeDetectorRef,
        public collectionService: CollectionService,
        public lpService: LandingpageService,
        public iconLibrary: FaIconLibrary,
        private notificationService: NotificationService) {
        
        iconLibrary.addIcons(
            faPencil,
            faXmark,
            faSave,
            faUndo
        );

        this.collectionOrder = this.collectionService.getCollectionForDisplay();
        this.allCollections = this.collectionService.loadAllCollections();
    }

    ngOnInit(): void {
        let id = 1
        for (let col of this.collectionOrder) {
            if (this.allCollections[col].theme !== "ScienceTheme") continue; // Only show science theme collections
            
            this.collectionData.push({
                id: id++,
                displayName: this.allCollections[col].displayName,
                value: this.allCollections[col].value
            });
        }

        this.collectionData.push({
            id: id,
            displayName: "Do not add to any domain collection",
            value: "None"
        });

        this.selectedCollection = this.getSelectedCollectionName();
        this.savedCollection = this.selectedCollection;
        this.originalCollection = this.selectedCollection;
        this.collectionHistory.push(this.selectedCollection);
            
        // Watch editing status
        this.lpService.watchEditing((sectionMode: SectionMode) => {
            if( sectionMode ) {
                if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                    if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORMAL) {
                        if(this.isEditing){
                            this.saveCollection(false); // Do not refresh help text 
                        }else{
                            this.setMode(MODE.NORMAL, false);
                        }
                    }
                }else { // Request from side bar, if not edit mode, start editing
                    if( !this.isEditing && sectionMode.section == this.fieldName && this.isEditMode) {
                        this.startEditing();
                    }
                }
            }
        })      
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.record) {
            this.selectedCollection = this.getSelectedCollectionName();
            this.savedCollection = this.selectedCollection;
        }
        this.chref.detectChanges();
    }

    getSelectedCollectionName() {
        let collectionID = "";
        if(this.record && this.record['isPartOf'] && Array.isArray(this.record['isPartOf']) && 
            this.record['isPartOf'].length > 0 && this.record['isPartOf'][0]['@id']) {
                collectionID = this.record['isPartOf'][0]['@id'].replace("ark:/88434/", '');
        }

        return this.collectionService.getCollectionNameByID(collectionID);
    }

    /**
     * Hide edit block
     */
    hideEditBlock() {
        this.isEditing = false;
        this.overflowStyle = 'hidden';
        this.editBlockStatus = 'collapsed';
        this.chref.detectChanges();
    }

    startEditing() {
        this.setMode(MODE.EDIT);
    }

    closeEditBlock() {
        this.setMode(MODE.NORMAL, true);
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); } 
 
    undo() {
        this.collectionHistory.pop(); // Remove current selection
        this.selectedCollection = this.collectionHistory.pop();
        this.dataChanged = true;
        this.saveCollection(true);
        this.chref.detectChanges();
    }   

    /**
     * Refresh the help text
     */
    refreshHelpText(){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];
        this.lpService.setSectionHelp(sectionHelp);
    }    

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORMAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            this.refreshHelpText();
        }
            
        switch ( this.editMode ) {
            case MODE.EDIT:
                this.isEditing = true;
                this.editBlockStatus = 'expanded';
                this.setOverflowStyle();
                break;
 
            default: // normal
                this.isEditing = false;
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.dataChanged = false;
                this.setOverflowStyle();
                this.dataChanged = false;
                break;
        }

        // this.getRecordBackgroundColor();
        //Broadcast the current section and mode
        //refreshHelp=false means this widget is closed by other widget, 
        //do not broadcast the section mode because other widget already did that.
        if(refreshHelp){
            this.lpService.setEditing(sectionMode);
            // this.globalsvc.sectionMode.set(sectionMode);
        }

        this.chref.detectChanges();
    }
    
    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */    
    setOverflowStyle() {
        if(this.editBlockStatus == 'collapsed') {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }    

    /**
     * Save the current collection
     * @param refreshHelp indicates if help text need to be refreshed after save
     */
    saveCollection(refreshHelp) {
        //Save collection then close edit block
        if (this.dataChanged) {
            this.collectionHistory.push(this.selectedCollection);
            
            if(this.selectedCollection == "None") {
                this.mdupdsvc.delete(this.fieldName).then((updateSuccess) => {
                    if (updateSuccess) {
                        this.savedCollection = this.selectedCollection;
                        this.notificationService.showSuccessWithTimeout("Collection removed successfully.", "", 3000);
                        this.setMode(MODE.NORMAL, refreshHelp);
                    } else {
                        let msg = "Failed to remove collection.";
                        console.error(msg);
                    }
                });
            } else {
                var postMessage: any = {};
                postMessage[this.fieldName] = {"label": this.selectedCollection};
                
                this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                    if (updateSuccess){
                        this.dataChanged = false;
                        this.savedCollection = this.selectedCollection;
                        this.notificationService.showSuccessWithTimeout("Successfully updated.", "", 3000);
                        this.setMode(MODE.NORMAL, refreshHelp);
                    }else{
                        let msg = "Update failed.";
                        console.error(msg);
                    }
                });                
            }
        }else{
            this.setMode(MODE.NORMAL, refreshHelp);
            this.chref.detectChanges();
        }
    }

    deleteCollection() {
        this.mdupdsvc.delete(this.fieldName).then((updateSuccess) => {
            if (updateSuccess){
                this.selectedCollection = "None";
                this.notificationService.showSuccessWithTimeout("Successfully deleted.", "", 3000);
                this.setMode(MODE.NORMAL, true);
            }else{
                let msg = "Failed to remove collection.";
                console.error(msg);
            }
        });
    }   

    undoCurCollectionChanges() {
        this.selectedCollection = this.originalCollection;
        this.dataChanged = false;
        this.setMode(MODE.NORMAL, true);
    }

    colChanged(event) {
        this.selectedCollection = event.target.value;
        this.dataChanged = true;
    }    

   /**
     * Return icon class of edit button
     * @returns icon class
     */
    getEditIconClass() {
        if(this.isEditing){
            return "icon_disabled";
        }else{
            return "icon_enabled";
        }
    }    

   /**
     * Return icon class of edit button
     * @returns icon class
     */
    getUndoIconClass() {
        if(this.isEditing){
            return "icon_disabled";
        }else{
            return "icon_enabled";
        }
    }        
}
