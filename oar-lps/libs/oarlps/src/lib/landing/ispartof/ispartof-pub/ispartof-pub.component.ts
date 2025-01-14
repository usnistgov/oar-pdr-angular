import { Component, Input } from '@angular/core';

@Component({
  selector: 'ispartof-pub',
  standalone: true,
  imports: [],
  templateUrl: './ispartof-pub.component.html',
  styleUrls: ['./ispartof-pub.component.scss', '../../landing.component.scss']
})
export class IspartofPubComponent {

    @Input() record: any[];
    @Input() isPartOf: string[] = null;
    
}
