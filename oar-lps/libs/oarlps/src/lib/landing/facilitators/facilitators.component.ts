import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../shared/globals/globals';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { CommonModule } from '@angular/common';
import { AuthorListComponent } from '../author/author-list/author-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-facilitators',
    standalone: true,
    imports: [
        CommonModule, 
        NgbModule,
        AuthorListComponent
    ],    
    templateUrl: './facilitators.component.html',
    styleUrls: ['./facilitators.component.css', '../landing.component.scss'],
    animations: [
        trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate(625)),
        //   transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('editExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class FacilitatorsComponent implements OnInit {
    facilitators: any[] = [];
    clickFacilitators: boolean = false;
    isCollapsedContent: boolean = true;
    isEditing: boolean = false;
    fieldName = SectionPrefs.getFieldName(Sections.FACILITATORS);
    editMode: string = MODE.NORNAL; 
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';
    orderChanged: boolean = false;
    childEditMode: string = MODE.NORNAL;

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    constructor(
        public mdupdsvc : MetadataUpdateService,   
        public lpService: LandingpageService
    ) { 
        this.lpService.watchEditing((sectionMode: SectionMode) => {
            if( sectionMode ) {
                if(sectionMode.sender == SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                     // Request from side bar, if not edit mode, start editing
                    if( !this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
                        this.startEditing();
                    }
                }
            }

        })
    }

    ngOnInit(): void {
        if(this.record["facilitators"]){
            this.facilitators = this.record["facilitators"];
        }
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.anyFieldUpdated(this.fieldName); }
    get childIsEditing() { return this.childEditMode==MODE.EDIT }
    get childIsAdding() { return this.childEditMode==MODE.ADD }

    getFieldStyle() {
        return "";
    }

    clicked = false;
    expandClick() {
        this.clicked = !this.clicked;
        return this.clicked;
    }

    startEditing(refreshHelp: boolean = true) {
        this.setMode(MODE.LIST, refreshHelp, MODE.LIST);
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
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true, help_topic: string = MODE.EDIT) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            if(editmode == MODE.NORNAL) help_topic = MODE.NORNAL;
            this.refreshHelpText(help_topic);
        }
            
        switch ( this.editMode ) {
            case MODE.LIST:
                this.editBlockStatus = "expanded";
                this.setOverflowStyle();
                this.isEditing = true;
                break;

            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.setOverflowStyle();
                this.isEditing = false;
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
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
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onAuthorChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'hideEditBlock':
                this.hideEditBlock();
                break;
            case 'dataChanged':

                break;
            case 'orderChanged':
                this.orderChanged = true;
                break;
            case 'orderReset':
                this.orderChanged = false;
                break;
            default:
                break;
        }
    }

    /**
     * Hide edit block
     */
    hideEditBlock() {
        this.isEditing = false;
        this.overflowStyle = 'hidden';
        this.editBlockStatus = 'collapsed';
    }

    /**
     * Update the edit status of child component 
     * so we can set the status of the close button
     * @param editmode editmode from child component
     */
    setChildEditMode(editmode: string) {
        this.childEditMode = editmode;
    }
}
