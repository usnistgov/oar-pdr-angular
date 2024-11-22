import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-inputnumber',
  templateUrl: './inputnumber.component.html',
  styleUrls: ['./inputnumber.component.css']
})
export class InputnumberComponent implements OnInit {
    number:number = 1;
    constructor() { }

    ngOnInit(): void {
    }

}
