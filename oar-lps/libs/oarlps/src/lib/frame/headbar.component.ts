import { Component, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * A Component that serves as the header of the landing page.  
 * 
 * Features include:
 * * Set as black bar at the top of the page
 * * NIST PDR logo that links to the PDR home page (currently the SDP)
 * * PDR-wide links:
 *   * About page
 *   * Search page (the SDP)
 *   * User's Datacart
 * * Labels indicating the version and status of the PDR
 *   * this uses the badge style from bootstrap
 */
@Component({
    selector: 'pdr-headbar',
    templateUrl: 'headbar.component.html',
    styleUrls: ['headbar.component.css']
})
export class HeadbarComponent {

    inBrowser: boolean = false;
    layoutCompact: boolean = true;
    layoutMode: string = 'horizontal';
    status: string = "";
    appVersion: string = "";
    cartLength: number = 0;
    editEnabled: any;
    // editMode: string;
    contactLink: string = "";
    public EDIT_MODES: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object)
    {
        this.inBrowser = isPlatformBrowser(platformId);
    }

    /*
    *   init
    */
    ngOnInit() {
    }

    /*
     *   Open about window if not in edit mode. Otherwise do nothing.
     */
    openRootPage() {
        window.open('/', '_self');
    }

    /**
     *   Get color for top menu (only handle Cart at this time. May handle other items later)
     *     enabled: white
     *     disabled: grey
     */
    getMenuColor(item?: string){
      if(item == 'Cart'){
        if(this.editEnabled){
          return "grey";
        }else{
          return "white"
        }
      }else{
        return "white"
      }
    }
}
