import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
// import * as footerlinks from '../assets/site-constants/footer-links.json';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { AuthenticationService, Credentials, ConfigurationService } from 'oarng';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterState } from '@angular/router';
import { Title } from '@angular/platform-browser';

declare const gtag: Function;

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
    ga4Code: string = null;
    inBrowser: boolean = false;
    hostName: string = "dada.nist.gov";

    @ViewChild('footbar') elementView!: ElementRef;

    constructor(private cfg: AppConfig,
                private toastrService: ToastrService,
                @Inject(PLATFORM_ID) private platformId: Object,
                public gaService: GoogleAnalyticsService,
                public router: Router,
                private titleService: Title,
                @Inject(DOCUMENT) private document: Document)
    {
        this.inBrowser = isPlatformBrowser(platformId);
        this.clientHeight = window.innerHeight;
        this.appVersion = this.cfg.get<string>('systemVersion', '0.0');
        this.gaCode = this.cfg.get<string>('gaCode', '');
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
    }

    ngAfterViewInit(): void {
        if(this.inBrowser){
            this.gaCode = this.cfg.get("gaCode", "") as string;
            this.ga4Code = this.cfg.get("ga4Code", "") as string;
            let homeurl = this.cfg.get("links.portalBase", "data.nist.gov") as string;

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
                let title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
                if (!title) title = "DAP Wizard";
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


    onResize(event: any){
        // console.log(window.innerHeight)
        // this.clientHeight = window.innerHeight; // window width
    }
}
