import { Component, Input } from '@angular/core';

@Component({
  selector: 'title-pub',
  standalone: true,
  imports: [],
  templateUrl: './title-pub.component.html',
  styleUrls: ['./title-pub.component.css', '../../landing.component.scss']
})
export class TitlePubComponent {
    @Input() record: any[];
}
