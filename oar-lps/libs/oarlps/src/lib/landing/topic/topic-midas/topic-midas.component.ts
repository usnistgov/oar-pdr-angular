import { Component, OnInit, Input, ElementRef, SimpleChanges, ViewChild, ChangeDetectorRef, inject, ContentChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { NerdmRes } from '../../../nerdm/nerdm';
import { AppConfig } from '../../../config/config';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, Collections, ColorScheme, GlobalService } from '../../../shared/globals/globals';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { CommonModule } from '@angular/common';
import { TopicEditComponent } from '../topic-edit/topic-edit.component';
import { TopicPubComponent } from '../topic-pub/topic-pub.component';

@Component({
    selector: 'topic-midas',
    standalone: true,
    imports: [ 
        CommonModule, 
        TopicEditComponent,
        TopicPubComponent,
        NgbModule
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

    //NIST Taxonomy URI si defined in /assets/site-constants/collections.json
    standardNISTTaxonomyURI: string = "https://data.nist.gov/od/dm/nist-themes/v1.1";
    allCollections: any = {};
    //  Array to define the collection order
    collectionOrder: string[] = [Collections.DEFAULT];
    collection: string;
    editCollection: string; //parameter pass to the edit component
    editScheme: string = "https://data.nist.gov/od/dm/nist-themes/v1.1"; //current topic scheme pass to the edit component
    topics: any = {};
    originalTopics: any = {};   //For undo purpose

    //For display
    topicBreakPoint: number = 5;
    topicDisplay: any = {};
    topicShort: any = {};
    topicLong: any = {};
    colorScheme: ColorScheme;
    hovered: boolean = false;

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
                private chref: ChangeDetectorRef,
                public lpService: LandingpageService, 
                public collectionService: CollectionService,
                private notificationService: NotificationService)
    {
        this.standardNISTTaxonomyURI = this.cfg.get("standardNISTTaxonomyURI", "https://data.nist.gov/od/dm/nist-themes/");

        this.collectionOrder = this.collectionService.getCollectionForDisplay();
        this.allCollections = this.collectionService.loadAllCollections();

        this.globalsvc.watchCollection((collection) => {
            this.collection = collection;
        });    
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
        this.colorScheme = this.collectionService.getColorScheme(this.collection);

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
        // setTimeout(()=>{ // this will make the execution after the above boolean has changed
        //     this.topicElement.nativeElement.focus();
        // },0);  

        this.editCollection = collection;
        this.editScheme = this.allCollections[this.editCollection].taxonomyURI;
        this.selectedTopics = [];
        //For new topic structure
        // if(this.topics && this.topics[collection]) {
        //     for(let obj of this.topics[collection]) {
        //         this.selectedTopics.push(obj.tag);
        //     } 
        // }

        //For old topic structure (theme)
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
                console.error("acknowledge topic update failure");
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

        if(inputTopics[this.editCollection] && inputTopics[this.editCollection].length > 0) {
            for(let topic of inputTopics[this.editCollection]) {
                topics.push(topic);
            }
        }

        return topics;
    }

    /**
     * Cancel current editing. Set this section to normal mode. Restore topics from previously saved ones.
     */
    cancelEditing() {
        this.updateResearchTopics();
        // this.setMode(MODE.NORMAL);
        // this.dataChanged = false;
    }

    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onDataChange(dataChanged: any) {
        switch(dataChanged.action) {
            case 'dataChanged':
                if(dataChanged[this.fieldName] && dataChanged[this.fieldName].length>0){
                    this.record[this.fieldName] = [];
                    dataChanged[this.fieldName].forEach((topic) => {
                        this.record[this.fieldName].push(topic.tag);
                    })
                }

                // For new topic structure (topic field)
                // this.record[this.fieldName] = dataChanged[this.fieldName];
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
                this.notificationService.showSuccessWithTimeout("Reverted changes to landingpage.", "", 3000);
                this.setMode();
            }else
                console.error("Failed to undo landingpage metadata")
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
        if(editmode != MODE.NORMAL)
            // this.globalsvc.sectionMode.set(sectionMode);
            this.lpService.setEditing(sectionMode);   
        
        this.chref.detectChanges();
    }

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */    
    // setOverflowStyle() {
    //     if(this.editBlockStatus == 'collapsed') {
    //         this.overflowStyle = 'hidden';
    //     }else {
    //         this.overflowStyle = 'hidden';
    //         setTimeout(() => {
    //             this.overflowStyle = 'visible';
    //         }, 1000);
    //     } 
    // }

    /**
     * Update the research topic lists
     */
    // updateResearchTopics() {
    //     if(this.record) {
    //         this.scienceThemeTopics = [];
    //         this.nistTaxonomyTopics = [];

    //         if(this.record['topic']) {
    //             this.record['topic'].forEach(topic => {
    //                 if(topic['scheme'].indexOf(this.standardNISTTaxonomyURI) < 0){
    //                     if(this.scienceThemeTopics.indexOf(topic.tag) < 0)
    //                         this.scienceThemeTopics.push(topic.tag);
    //                 }
    //             });
    //         }

    //         if(this.record['theme']) {
    //             this.record['theme'].forEach(topic => {
    //                 if(this.nistTaxonomyTopics.indexOf(topic) < 0)
    //                     this.nistTaxonomyTopics.push(topic);
    //             });
    //         }
    //     }
    // }


    /**
     * Update the research topic lists
     */
    updateResearchTopics() {
        this.topics = {};
        if(this.record) {
            if (this.record[this.fieldName]) {
                //For new topic structure
                this.record[this.fieldName].forEach(topic => {
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

                //For old topic (under theme field)
                // this.record[this.fieldName].forEach(topic => {
                //     if(!this.topics["NIST"]) {
                //             this.topics["NIST"] = [topic];
                //         }else if(this.topics["NIST"].indexOf(topic) < 0) {
                //             this.topics["NIST"].push(topic);
                //         }
                // });
            }
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
                this.notificationService.showSuccessWithTimeout("Reverted changes to research topic.", "", 3000);
                this.setMode(MODE.NORMAL);
                this.updateResearchTopics();
                // this.setBackground();
            } else{
                let msg = "Failed to undo research topic";
                console.error(msg);
            }
        });
    }

    /**
     * Function to Check if record has topics
     */
    // checkTopics() {
    //     if (Array.isArray(this.record[this.fieldName])) {
    //         if (this.record[this.fieldName].length > 0)
    //             return true;
    //         else
    //             return false;
    //     }
    //     else {
    //         return false;
    //     }
    // }

    /**
     * Set bubble color based on content
     * @param topic 
     */
    // bubbleColor(topic) {
    //     if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
    //         return "#e6ecff";
    //     }else{
    //         return "#ededed";
    //     }
    // }

    /**
     * Set border for "More..." and "Less..." button when mouse over
     * @param keyword 
     * @returns 
     */    
    // borderStyle(topic) {
    //     if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
    //         if(this.hovered){
    //             return "1px solid blue";
    //         }else{
    //             return "1px solid #ededed";
    //         }
    //     }else{
    //         return "1px solid #ededed";
    //     }
    // }

    /**
     * Set cursor type for "More..." and "Less..." button
     * @param topic 
     * @returns 
     */
    // setCursor(topic) {
    //     if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
    //         return "pointer";
    //     }else{
    //         return "";
    //     }
    // }

    // mouseEnter(topic) {
    //     if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
    //         this.hovered = true;
    //     }
    // }

    // mouseOut(topic) {
    //     if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
    //         this.hovered = false;
    //     }
    // }

    /**
     * Display short/long list based on which button was clicked.
     * @param topic 
     */
    // topicClick(topic, collection) {
    //     if(topic.tag == "Show more...") {
    //         this.topicDisplay[collection] = JSON.parse(JSON.stringify(this.topicLong[collection]));
    //     }

    //     if(topic.tag == "Show less...") {
    //         this.topicDisplay[collection] = JSON.parse(JSON.stringify(this.topicShort[collection]));
    //     }

    //     this.hovered = false;
    // }

}
