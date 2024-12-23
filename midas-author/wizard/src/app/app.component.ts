import { Component, ElementRef, ViewChild } from '@angular/core';
// import * as footerlinks from '../assets/site-constants/footer-links.json';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { AuthenticationService, Credentials, ConfigurationService } from 'oarng';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    host: {
        '(window:resize)': 'onResize($event)'
    }
})
export class AppComponent {
    title = 'Create a New DAP';
    clientHeight: number = 500;
    footbarHeight!: number;
    appVersion: string;
    gaCode: string;

    @ViewChild('footbar') elementView!: ElementRef;

    constructor(private cfg: AppConfig,
                private toastrService: ToastrService,
                public gaService: GoogleAnalyticsService)
    { 
        this.clientHeight = window.innerHeight; 
        this.appVersion = this.cfg.get<string>('systemVersion', '0.0');
        this.gaCode = this.cfg.get<string>('gaCode', '');
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
