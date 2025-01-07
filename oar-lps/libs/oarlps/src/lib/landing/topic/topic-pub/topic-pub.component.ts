import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Collections, ColorScheme } from '../../../shared/globals/globals';
import { NerdmRes } from '../../../nerdm/nerdm';

@Component({
    selector: 'topic-pub',
    standalone: true,
    imports: [ 
        CommonModule, 
        NgbModule
    ],
    templateUrl: './topic-pub.component.html',
    styleUrls: ['./topic-pub.component.css','../../landing.component.scss']
})
export class TopicPubComponent {
    collectionOrder: string[] = [Collections.DEFAULT];
    topics: any = {};

    //For display
    topicBreakPoint: number = 5;
    topicDisplay: any = {};
    topicShort: any = {};
    topicLong: any = {};
    colorScheme: ColorScheme;
    hovered: boolean = false;

    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean;   // false if running server-side

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
}
