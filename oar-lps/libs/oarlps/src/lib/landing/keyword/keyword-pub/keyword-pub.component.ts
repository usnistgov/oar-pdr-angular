import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { SectionPrefs, Sections } from '../../../shared/globals/globals';

@Component({
  selector: 'keyword-pub',
  standalone: true,
  imports: [
    CommonModule, 
  ],
  templateUrl: './keyword-pub.component.html',
  styleUrls: ['./keyword-pub.component.css', '../../landing.component.scss']
})
export class KeywordPubComponent {
    keywordDisplay: string[] = [];
    keywordShort: string[] = [];
    keywordLong: string[] = [];
    keywordBreakPoint: number = 5;
    hovered: boolean = false;
    fieldName: string = SectionPrefs.getFieldName(Sections.KEYWORDS);

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    constructor(private chref: ChangeDetectorRef){ 
    }

    get keywordWidth() {
        return {'width': 'fit-content', 'max-width': 'calc(100% - 560px)'};
    }

    ngOnInit() {
        this.keywordInit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.record){
            this.keywordInit();
        }

        this.chref.detectChanges();
    }

    /**
     * Generate short and long keyword list for display
     */
    keywordInit() {
        if(this.record[this.fieldName]) {
            if(this.record[this.fieldName].length > 5) {
                this.keywordShort = JSON.parse(JSON.stringify(this.record[this.fieldName])).slice(0, this.keywordBreakPoint);
                this.keywordShort.push("Show more...");
                this.keywordLong = JSON.parse(JSON.stringify(this.record[this.fieldName]));
                this.keywordLong.push("Show less...");                
            }else {
                this.keywordShort = JSON.parse(JSON.stringify(this.record[this.fieldName]));
                this.keywordLong = JSON.parse(JSON.stringify(this.record[this.fieldName]));
            }
        }else{
            this.keywordShort = [];
            this.keywordLong = [];
        }

        this.keywordDisplay = this.keywordShort;
    }

    /**
     * Set bubble color based on content
     * @param keyword 
     */
    bubbleColor(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
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
    borderStyle(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            if(this.hovered){
                return "1px solid blue";
            }else{
                return "1px solid #ededed";
            }
        }else{
            return "1px solid #ededed";
        }
    }

    mouseEnter(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            this.hovered = true;
            this.chref.detectChanges();
        }
    }

    mouseOut(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            this.hovered = false;
            this.chref.detectChanges();
        }
    }

    /**
     * Display short/long list based on which button was clicked.
     * @param keyword 
     */
    keywordClick(keyword) {
        if(keyword == "Show more...") {
            this.keywordDisplay = this.keywordLong;
        }

        if(keyword == "Show less...") {
            this.keywordDisplay = this.keywordShort;
        }

        this.hovered = false;
        this.chref.detectChanges();
    }

    /**
     * Set cursor type for "More..." and "Less..." button
     * @param keyword
     * @returns 
     */
    setCursor(keyword) {
        if(keyword == "Show more..." || keyword == "Show less..." ) {
            return "pointer";
        }else{
            return "";
        }
    }        
}
