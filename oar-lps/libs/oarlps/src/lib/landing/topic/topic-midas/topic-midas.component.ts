import { Component, OnInit, Input, ElementRef, SimpleChanges, ViewChild, ChangeDetectorRef, inject, ContentChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { NerdmRes } from '../../../nerdm/nerdm';
import { AppConfig } from '../../../config/config';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {
    SectionMode,
    SectionHelp,
    MODE,
    SectionPrefs,
    Sections,
    Collections,
    ColorScheme,
    GlobalService,
    iconClass,
    Topic
} from '../../../shared/globals/globals';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { CommonModule } from '@angular/common';
import { TopicEditComponent } from '../topic-edit/topic-edit.component';
import { TopicPubComponent } from '../topic-pub/topic-pub.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faPencil,
    faXmark,
    faSave,
    faUndo
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'topic-midas',
    standalone: true,
    imports: [ 
        CommonModule, 
        TopicEditComponent,
        TopicPubComponent,
        NgbModule,
        FontAwesomeModule
    ],
    templateUrl: './topic-midas.component.html',
    styleUrls: ['../topic.component.css','../../landing.component.scss'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class TopicMidasComponent implements OnInit {
    selectedTopics: any[] = [];
    scienceThemeTopics: any[] = [];
    recordType: string = "";

    allCollections: any = {};
    //  Array to define the collection order
    collectionOrder: string[] = [Collections.DEFAULT];
    collection: string;
    editCollection: string; //parameter pass to the edit component
    editScheme: string = ""; //current topic scheme pass to the edit component
    topics: any = {};
    originalTopics: any = {};   //For undo purpose

    //keep the topics that are not being edited, 
    // this is for the case when there are multiple topic collections 
    // and user only want to edit one collection, 
    // we need to keep the other collections unchanged.
    otherTopics: Topic[] = [];  

    //For display
    topicBreakPoint: number = 5;
    topicDisplay: any = {};
    topicShort: any = {};
    topicLong: any = {};
    // colorScheme: any;
    hovered: boolean = false;

    //icon class names
    // editIcon = iconClass.EDIT;
    // closeIcon = iconClass.CLOSE;
    // saveIcon = iconClass.SAVE;
    // cancelIcon = iconClass.CANCEL;
    // undoIcon = iconClass.UNDO;

    faPencil = faPencil;
    faXmark = faXmark;
    faSave = faSave;
    faUndo = faUndo;

    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() isEditMode: boolean = true;

    @ViewChild('topic') topicElement: ElementRef;
    @ContentChild('tmpl') tmplRef: TemplateRef<any>;
    
    //05-12-2020 Ray asked to read topic data from 'theme' instead of 'topic'
    fieldName = SectionPrefs.getFieldName(Sections.TOPICS);
    // fieldName = "theme";
    editMode: string = MODE.NORMAL; 
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';
    dataChanged: boolean = false;
    globalsvc = inject(GlobalService);

    constructor(public mdupdsvc: MetadataUpdateService,
        private cfg: AppConfig,
                // public globalService: GlobalService,
                private chref: ChangeDetectorRef,
                public lpService: LandingpageService, 
                public collectionService: CollectionService,
                public iconLibrary: FaIconLibrary,
                private notificationService: NotificationService) {

        // iconLibrary.addIcons(
        //     faPencil,
        //     faXmark,
        //     faSave,
        //     faUndo
        // );
        
        this.collectionOrder = this.collectionService.getCollectionForDisplay();
        this.allCollections = this.collectionService.loadAllCollections();

        this.globalsvc.watchCollection((collection) => {
            this.collection = collection;
        });    

        // this.globalService.watchColorPalette((colorPalette) => {
        //     this.colorScheme = colorPalette;
        // })    
    }

    updated(collection: string = Collections.DEFAULT) { 
        return this.mdupdsvc.fieldUpdated(this.fieldName + "-" + collection); 
    }

    get isEditing() { return this.editMode==MODE.EDIT }

    get isNormal() { return this.editMode==MODE.NORMAL }

    get topicWidth() {
        if(this.isEditing){
            return {'width': 'fit-content', 'max-width': 'calc(100% - 400px)', 'height':'fit-content'};
        }else{
            return {'width': 'fit-content', 'max-width': 'calc(100% - 360px)'};
        }
    }

    isDefaultCollection(collection) {
        return collection == Collections.DEFAULT;
    }

    ngOnInit() {
        let editMode = this.isEditMode;
        // this.colorScheme = this.collectionService.getColorScheme(this.collection);

        this.updateResearchTopics();
        this.originalTopics = JSON.parse(JSON.stringify(this.topics));

        this.lpService.watchEditing((sectionMode: SectionMode) => {            
            if( sectionMode ) {
                if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                    if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORMAL) {
                        if(this.isEditing && this.dataChanged){
                            this.onSave(false); // Do not refresh help text 
                        }
                        this.setMode(MODE.NORMAL,false);
                    }
                }else { // Request from side bar, if not edit mode, start editing
                    if( !this.isEditing && sectionMode.section == this.fieldName && this.isEditMode) {
                        this.startEditing();
                    }
                }
            }
        })            
    }

    /**
     * Once input record changed, refresh the topic list 
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.updateResearchTopics();

        this.chref.detectChanges();
    }

    /**
     * Decide if given collection's topic is in edit mode
     * @param collection 
     * @returns 
     */
    editingTopics(collection: string) {
        return this.isEditing && this.editCollection == collection;
    }

    /**
     * a field indicating if this data has beed edited
     */
    // get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    isUpdated(collection: string = Collections.DEFAULT) { 
        return this.mdupdsvc.fieldUpdated(this.fieldName + "-" + collection); 
    }

    /**
     * Start editing topics. Set this section in edit mode and broadcast the status so other section will auto save
     * and the help side bar can update the info.
     */
    startEditing(collection: string = Collections.DEFAULT) {
        this.editCollection = collection;
        this.editScheme = this.allCollections[this.editCollection].taxonomyURI;
        this.selectedTopics = [];

        if(this.topics && this.topics[collection]) {
            for(let topic of this.topics[collection]) {
                this.selectedTopics.push(topic);
            } 
        }

        this.setMode(MODE.EDIT);
    }

    /**
     * Save topics.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        var postMessage: any = {};
        let field = this.fieldName + "-" + this.editCollection;

        postMessage[this.fieldName] = this.restoreTopics(this.topics);

        this.mdupdsvc.update(field, postMessage, null, this.fieldName).then((updateSuccess) => {
            if (updateSuccess) {
                this.notificationService.showSuccessWithTimeout("Research topics updated.", "", 3000);
                this.record[this.fieldName] = postMessage[this.fieldName];
                this.updateResearchTopics();
                this.setMode(MODE.NORMAL,refreshHelp);
            } else
                console.error("Topic update failed.");
        });

        this.dataChanged = false;
    }

    /**
     * Restore topics to Nerdm format
     */
    restoreTopics_for_collection(inputTopics: any) {
        let topics: any[] = [];

        for(let col of this.collectionOrder) {
            if(inputTopics[col] && inputTopics[col].length > 0) {
                for(let topic of inputTopics[col]) {
                    topics.push(topic);
                }
            }
        }

        return topics;
    }

    /**
     * Restore topics to Nerdm format
     */
    restoreTopics(inputTopics: any) {
        let topics: any[] = [];
        // let col = "NIST";

        for (let collection of this.collectionOrder) {
            if (inputTopics[collection] && inputTopics[collection].length > 0) {
                for (let topic of inputTopics[collection]) {
                    delete topic.id;
                    topics.push(topic);
                }
            }
        }

        //Restore the topics that are not in the main collections, such as those without scheme or with other schemes.
        if (this.otherTopics.length > 0) {
            this.otherTopics.forEach((topic) => {
                delete topic.id;
                topics.push(topic);
            });
        }

        return topics;
    }

    /**
     * Cancel current editing. 
     * Set this section to normal mode. 
     * Restore topics from previously saved ones.
     */
    cancelEditing() {
        this.updateResearchTopics();
        this.setMode(MODE.NORMAL);
        this.dataChanged = false;
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component. It's an object containing action and data.
     * "action" current just accepts "dataChanged". "data" is the updated topic list.
     */
    onDataChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'dataChanged':
                // For new topic structure (topic field)
                // Update current topics
                this.topics[this.editCollection] = dataChanged["data"];

                // Update the record with the updated topic list in Nerdm format (full topic list). 
                // This is for staging area and will not update the original record until user click save button.
                this.record[this.fieldName] = this.restoreTopics(this.topics);

                this.dataChanged = true;
                break;
            default:
                break;
        }
    }

    /**
     * Handle commands from child component
     * @param cmd command from child component
     */
    onCommandChanged(cmd) {
        switch(cmd.command) {
            case 'saveTopics':
                this.topics[this.editCollection] = cmd.selectedTopics;
                this.onSave();
                break;
            case 'undoCurrentChanges':
                this.cancelEditing();
                break;
            default:
                break;
        }
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

    /*
     *  Restore original value. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal(collection: string) {
        if(!this.originalTopics || !this.originalTopics[collection] || this.originalTopics[collection].length == 0)
            this.topics[collection] = null;
        else
            this.topics[collection] = JSON.parse(JSON.stringify(this.originalTopics[collection]));

        this.mdupdsvc.undo(this.fieldName+"-"+collection, null, null, this.restoreTopics(this.topics)).then((success) => {
            if (success){
                this.dataChanged = false;
                this.notificationService.showSuccessWithTimeout("Reverted changes to topics.", "", 3000);
                this.setMode();
            }else
                console.error("Failed to undo topic metadata")
        });
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
                this.editBlockStatus = 'expanded';
                this.overflowStyle = 'hidden';
                setTimeout(() => {
                    this.overflowStyle = 'visible';
                }, 1000);
                break;
 
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.overflowStyle = 'hidden';
                break;
        }

        //Broadcast the current section and mode
        //refreshHelp=false means this widget is closed by other widget, 
        //do not broadcast the section mode because other widget already did that.
        if (refreshHelp) {
            // this.globalsvc.sectionMode.set(sectionMode);
            this.lpService.setEditing(sectionMode);
        }
        
        this.chref.detectChanges();
    }

    /**
     * Update the research topic lists
     */
    updateResearchTopics() {
        let originalTopics = [];
        this.topics = {};
        let counter = 0;
        if(this.record) {
            if (this.record[this.fieldName]) {
                this.record[this.fieldName].forEach(topic => {
                    topic["id"] = counter++;
                    originalTopics.push(topic);
                    if (topic['scheme'] && topic.tag) {
                        for(let col of this.collectionOrder) {
                            if(topic['scheme'].indexOf(this.allCollections[col].taxonomyURI) >= 0){
                                if(!this.topics[col]) {
                                    this.topics[col] = [topic];
                                }else if(this.topics[col].indexOf(topic) < 0) {
                                    this.topics[col].push(topic);
                                }
                            }
                        }
                    } 
                });
            }

            // Get the topics that do not belong to main collections, such as those without scheme or with other schemes.

            for (let col of this.collectionOrder) {
                if(this.topics[col] && this.topics[col].length > 0) {
                    const idsToRemove = new Set(this.topics[col].map(item => item.id));
                    originalTopics = originalTopics.filter(item => !idsToRemove.has(item.id));
                }
            }
            this.otherTopics = originalTopics;
        }

        //For display
        for(let col of this.collectionOrder) {
            if(this.topics[col]) {
                if(this.topics[col].length > 5) {
                    this.topicShort[col] = JSON.parse(JSON.stringify(this.topics[col].slice(0, this.topicBreakPoint)));
                    this.topicShort[col].push({tag:"Show more...", "@type":"", scheme:""});
                    this.topicLong[col] = JSON.parse(JSON.stringify(this.topics[col]));
                    this.topicLong[col].push({tag:"Show less...", "@type":"", scheme:""});                
                }else {
                    this.topicShort[col] = JSON.parse(JSON.stringify(this.topics[col]));
                    this.topicLong[col] = JSON.parse(JSON.stringify(this.topics[col]));
                }
            }else {
                this.topicShort[col] = [];
                this.topicLong[col] = []
            }
        }

        this.topicDisplay = JSON.parse(JSON.stringify(this.topicShort));
    }    

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success) {
                this.notificationService.showSuccessWithTimeout("Reverted changes to research topics.", "", 3000);
                this.setMode(MODE.NORMAL);
                this.updateResearchTopics();
            } else{
                let msg = "Failed to undo research topics metadata";
                console.error(msg);
            }
        });
    }
}
