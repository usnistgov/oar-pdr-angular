// import { UserMessageService } from './../../../oar-lps/libs/oarlps/src/lib/frame/usermessage.service';
// import { MessageBarComponent } from './../../../oar-lps/libs/oarlps/src/lib/frame/messagebar.component';
import { Component, AfterViewInit, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterState, ActivatedRoute } from '@angular/router';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from 'oarlps';
import { UserMessageService } from 'oarlps';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

declare const gtag: Function;

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
    homeButtonLink: string = "";
    ga4Code: string = null;
    hostName: string = "dada.nist.gov";

    constructor(
        private gaService: GoogleAnalyticsService,
        // public environmentService : EnvironmentService,
        private cfg: AppConfig,
        public cartService: CartService,
        public router: Router,
        private titleService: Title,
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) private document: Document,
        public msgSvc: UserMessageService)
    { 
        this.inBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.appVersion = this.cfg.get("systemVersion", "X.X") as string;
        this.homeButtonLink = this.cfg.get("links.portalBase", "") as string;

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
            this.ga4Code = this.cfg.get("ga4Code", "") as string;
            let homeurl = this.cfg.get("locations.portalBase", "data.nist.gov") as string;

            const url = new URL("https://" + homeurl);
            this.hostName = url.hostname;


            this.gaService.appendGaTrackingCode(this.gaCode, this.ga4Code, this.hostName);

            //Add GA4 code to track page view
            this.handleRouteEvents();
        }
    }

    /**
     * GA4 code to track page view when user navigates to different pages
     */
    handleRouteEvents() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
                this.titleService.setTitle(title);
                
                gtag('event', 'page_view', {
                    page_title: title,
                    page_path: event.urlAfterRedirects,
                    page_location: this.document.location.href,
                    cookie_domain: this.hostName, 
                    cookie_flags: 'SameSite=None;Secure'
                })
            }
        });
    }

    /**
     * Get page title if any
     * @param state router state
     * @param parent Activated route
     * @returns 
     */
    getTitle(state: RouterState, parent: ActivatedRoute): string[] {
        const data = [];
        if (parent && parent.snapshot.data && parent.snapshot.data['title']) {
            data.push(parent.snapshot.data['title']);
        }
        if (state && parent && parent.firstChild) {
            data.push(...this.getTitle(state, parent.firstChild));
        }
        return data;
    }

}

