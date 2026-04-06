import { Component, OnInit, Input } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'pdr-done',
  templateUrl: './done.component.html',
  styleUrls: ['./done.component.css']
})
export class DoneComponent implements OnInit {
    faSpinner = faSpinner;
    
    @Input() message: string;
    @Input() showSpinner: boolean = false;

    constructor() { }

    ngOnInit() {
    }

}
