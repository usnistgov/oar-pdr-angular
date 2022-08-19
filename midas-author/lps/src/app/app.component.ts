import { Component, AfterViewInit, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import './content/modal.less';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'PDR Resource Landing Page';
    gaCode: string;
    inBrowser: boolean = false;
    appVersion: string = "1.0"

    constructor(private gaService: GoogleAnalyticsService,
                // public environmentService : EnvironmentService,
                private cfg: AppConfig,
                @Inject(PLATFORM_ID) private platformId: Object)
    { 
        this.inBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.appVersion = this.cfg.get("appVersion", "1.0") as string;
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized.
        // Applies to components only.
        if(this.inBrowser){
            this.gaCode = this.cfg.get("gaCode", "") as string;
            this.gaService.appendGaTrackingCode(this.gaCode);
        }
    }
}

