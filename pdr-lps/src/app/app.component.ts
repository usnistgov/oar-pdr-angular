// import { UserMessageService } from './../../../oar-lps/libs/oarlps/src/lib/frame/usermessage.service';
// import { MessageBarComponent } from './../../../oar-lps/libs/oarlps/src/lib/frame/messagebar.component';
import { Component, AfterViewInit, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from 'oarlps';
import { MessageBarComponent } from 'oarlps';
import { UserMessageService } from 'oarlps';

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
    cartLength: any;

    constructor(
        private gaService: GoogleAnalyticsService,
        // public environmentService : EnvironmentService,
        private cfg: AppConfig,
        public cartService: CartService,
        @Inject(PLATFORM_ID) private platformId: Object,
        public msgSvc: UserMessageService)
    { 
        this.inBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.appVersion = this.cfg.get("appVersion", "1.0") as string;

        if(this.inBrowser){
            let globalcart = this.cartService.getGlobalCart();
            this.cartLength = globalcart.size();
            globalcart.watchForChanges((ev) => {
                this.cartLength = this.cartService.getGlobalCart().size();
            });
        }
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

