import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
    
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    get keywordWidth() {
        return {'width': 'fit-content', 'max-width': 'calc(100% - 360px)'};
    }
}
