import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, SimpleChanges } from '@angular/core';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs, GlobalService } from '../../../shared/globals/globals';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'ispartof-edit',
    standalone: true,
    imports: [
            CommonModule,
            ButtonModule,
            TooltipModule
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
    fieldName = SectionPrefs.getFieldName(Sections.COLLECTION);
    editBlockStatus: string = 'collapsed';
    editMode: string = MODE.NORMAL; 
    overflowStyle: string = 'hidden';
    selectedCollection: string = "Forensics";
    originalCollection: string = null;
    globalsvc = inject(GlobalService);

    collectionData = [
        {id: 1, displayName: "Additive Manufacturing", value: "AdditiveManufacturing"},
        {id: 2, displayName: "Chips Metrology (METIS)", value: "Metrology"},
        {id: 3, displayName: "Forensics", value: "Forensics"},
        {id: 4, displayName: "Do not add to any collection", value: "None"}
    ]

    @Input() record: any[];
    @Input() inBrowser: boolean; 
    @Input() isEditMode: boolean;

    constructor(
        public mdupdsvc : MetadataUpdateService, 
        private chref: ChangeDetectorRef,
        public lpService: LandingpageService
    ){
        // effect(() => {
        //     //Very tricky: have to use settimeout() here. Otherwise detectChanges does not work!
        //     setTimeout(() => {
        //         this.isEditMode = this.edstatsvc.isEditMode();
        //         this.chref.detectChanges();
        //     }, 0);
        // })
    }

    ngOnInit(): void {
        // this.isEditMode = this.edstatsvc.isEditMode();

        // effect(() => {
        //     let sectionMode = this.globalsvc.sectionMode();
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
        this.chref.detectChanges();
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
        if(editmode != MODE.NORMAL){
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

    saveCollection(refreshHelp) {
        //Save collection then close edit block

        this.dataChanged = false;
        this.setMode(MODE.NORMAL, refreshHelp);

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
}
