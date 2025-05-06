import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'landing-about',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './landingAbout.component.html',
    styleUrls: ['./landingAbout.component.css']
})
export class LandingAboutComponent implements OnInit {
 
    headerText: string;

    constructor() {
        
    }

    ngOnInit() {
    }
}
