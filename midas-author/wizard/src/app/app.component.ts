import { Component, ElementRef, ViewChild } from '@angular/core';
// import * as footerlinks from '../assets/site-constants/footer-links.json';
import { GoogleAnalyticsService } from 'oarlps'
import { LPSConfig } from 'oarlps';
import { AuthenticationService, Credentials, ConfigurationService } from 'oarng';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class AppComponent {
    title = 'OAR Module Demo: Wizard';
    clientHeight: number = 500;
    footbarHeight!: number;
    appVersion: string = "1.0";
    gaCode: string;
    confValues: LPSConfig;

    @ViewChild('footbar') elementView!: ElementRef;

    constructor(
        private configSvc: ConfigurationService,
        private gaService: GoogleAnalyticsService) { 
            this.clientHeight = window.innerHeight; 

            this.confValues = this.configSvc.getConfig();
            this.appVersion = this.confValues['appVersion'];
            this.gaCode = this.confValues['gaCode'] as string;
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
    }

    ngAfterViewInit(): void {

        this.gaService.appendGaTrackingCode(this.gaCode);
    }

    onResize(event: any){
        // console.log(window.innerHeight)
        // this.clientHeight = window.innerHeight; // window width
    }
}
