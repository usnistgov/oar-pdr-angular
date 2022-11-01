import { Component, OnInit, Input } from '@angular/core';
import { Reference } from '../reference';

@Component({
  selector: 'lib-single-ref',
  templateUrl: './single-ref.component.html',
  styleUrls: ['./single-ref.component.css']
})
export class SingleRefComponent implements OnInit {
    defaultText: string = "Enter citation here";
    refTypes: string[] = ["IsDocumentedBy","IsCitedBy"];

    @Input() ref: Reference = {} as Reference;

    constructor() { }

    ngOnInit(): void {
        console.log("ref", this.ref);
    }

    onChange() {
        this.ref.dataChanged = true;
        
    }
}
