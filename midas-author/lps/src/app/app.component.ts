import { Component, AfterViewInit, OnInit, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet, RouterLink, RouterState, ActivatedRoute } from '@angular/router';
// import './content/modal.less';
import { GoogleAnalyticsService } from 'oarlps'
import { AppConfig } from 'oarlps';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { AuthenticationService } from 'oarng';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { GlobalService, SectionMode, MODE } from 'oarlps';
import { Title } from '@angular/platform-browser';
import { LandingpageService } from 'oarlps';

declare const gtag: Function;

export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  parse(url: string): UrlTree {
      // Optional Step: Do some stuff with the url if needed.

      // If you lower it in the optional step
      // you don't need to use "toLowerCase"
      // when you pass it down to the next function
      return super.parse(url.toLowerCase());
  }
}

enableProdMode();

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
    authToken: string|null = null;
    homeButtonLink: string = "";
    ga4Code: string = null;
    hostName: string = "dada.nist.gov";
    sectionMode: SectionMode;

    constructor(private gaService: GoogleAnalyticsService,
                private authsvc: AuthenticationService,
                private cfg: AppConfig,
                public globalService: GlobalService,
                public router: Router,
                private titleService: Title,
                public lpService: LandingpageService,
                @Inject(DOCUMENT) private document: Document,
                @Inject(PLATFORM_ID) private platformId: Object)
    {
        this.inBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.appVersion = this.cfg.get("systemVersion", "X.X") as string;

        this.authsvc.getCredentials().subscribe(
            creds => {
                if (creds.token) {
                    this.authToken = creds.token;
                }
            }
        );
        
        this.lpService.watchEditing((sectionMode: SectionMode) => {   
            if (sectionMode) this.sectionMode = sectionMode;
        })        
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized.
        // Applies to components only.
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

    @HostListener('window:beforeunload', ['$event'])
    handleBeforeUnload(event: BeforeUnloadEvent): void {
        // To show a confirmation dialog (most modern browsers only show a generic message for security)
        if (this.sectionMode.mode == MODE.EDIT || this.sectionMode.mode == MODE.ADD) {
            event.preventDefault(); 
            // Some browsers may still require event.returnValue = true (or an empty string) 
            event.returnValue = ''; 
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

