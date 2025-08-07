import { ChangeDetectorRef, Component, Input, SimpleChanges, AfterContentInit, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NerdmRes } from '../../../nerdm/nerdm';
import { SectionMode, SectionHelp, MODE, SectionPrefs, Sections, Collections, ColorScheme, GlobalService } from '../../../shared/globals/globals';
import { CollectionService } from '../../../shared/collection-service/collection.service';

@Component({
    selector: 'topic-pub',
    standalone: true,
    imports: [ 
        CommonModule, 
        NgbModule
    ],
    templateUrl: './topic-pub.component.html',
    styleUrls: ['./topic-pub.component.css','../topic.component.css','../../landing.component.scss']
})
export class TopicPubComponent implements AfterContentInit {
    collectionOrder: string[] = [Collections.DEFAULT];
    topics: any = {};
    newTopics: any = {}; // For using topics field instead of theme

    //For display
    topicBreakPoint: number = 5;
    topicDisplay: any = {};
    topicShort: any = {};
    topicLong: any = {};
    colorScheme: ColorScheme;
    hovered: boolean = false;
    fieldName = SectionPrefs.getFieldName(Sections.TOPICS);
    allCollections: any = {};

    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() isEditMode: boolean = false;

    @ContentChild('contentTemplate') contentTemplate!: TemplateRef<any>;
    componentData = { message: 'Initial data from child' };

    constructor(private chref: ChangeDetectorRef,
                public collectionService: CollectionService)
    {
        this.collectionOrder = this.collectionService.getCollectionForDisplay();
        this.allCollections = this.collectionService.loadAllCollections();
 
    }

    showTopics(collection) {
        //Always display NIST R&D, then only display the collection terms that the article is part of
        if(this.isDefaultCollection(collection))
            return true;
        else {
            //Loop through "isPartOf" field
            if(this.record['isPartOf'] && Array.isArray(this.record['isPartOf']) && 
            this.record['isPartOf'].length > 0) {
                for(let c of this.record['isPartOf']) {
                    return (c.title.toLowerCase().indexOf(collection.toLowerCase()) > -1)
                }
            }else{
                return false;
            }
        }

    }    

    ngOnInit() {
        this.allCollections = this.collectionService.loadAllCollections();
        this.updateResearchTopics();
    }

    ngAfterContentInit() {
        setTimeout(() => {
          this.componentData = { message: 'Updated data from child' };
        }, 2000);
    }

    /**
     * Once input record changed, refresh the topic list 
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.updateResearchTopics();
        this.chref.detectChanges();
    }

    isDefaultCollection(collection) {
        return collection == Collections.DEFAULT;
    }

    /**
         * Set bubble color based on content
         * @param topic 
         */
    bubbleColor(topic) {
        if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
            return "#e6ecff";
        }else{
            return "#ededed";
        }
    }

    /**
     * Set border for "More..." and "Less..." button when mouse over
     * @param keyword 
     * @returns 
     */    
    borderStyle(topic) {
        if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
            if(this.hovered){
                return "1px solid blue";
            }else{
                return "1px solid #ededed";
            }
        }else{
            return "1px solid #ededed";
        }
    }  
    
    mouseEnter(topic) {
        if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
            this.hovered = true;
        }
    }

    mouseOut(topic) {
        if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
            this.hovered = false;
        }
    }

    /**
     * Set cursor type for "More..." and "Less..." button
     * @param topic 
     * @returns 
     */
    setCursor(topic) {
        if(topic.tag == "Show more..." || topic.tag == "Show less..." ) {
            return "pointer";
        }else{
            return "";
        }
    }

    /**
     * Display short/long list based on which button was clicked.
     * @param topic 
     */
    topicClick(topic, collection) {
        if(topic.tag == "Show more...") {
            this.topicDisplay[collection] = JSON.parse(JSON.stringify(this.topicLong[collection]));
        }

        if(topic.tag == "Show less...") {
            this.topicDisplay[collection] = JSON.parse(JSON.stringify(this.topicShort[collection]));
        }

        this.hovered = false;
    }

    /**
     * Update the research topic lists
     */
    updateResearchTopics() {
        this.topics = {};
        if(this.record) {
            if (this.record[this.fieldName]) {
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
}
