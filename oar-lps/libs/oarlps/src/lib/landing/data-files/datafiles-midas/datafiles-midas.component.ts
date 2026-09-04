import { Component, Input, Output, NgZone, OnInit, OnChanges, SimpleChanges, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../../datacart/cart.service';
import { AppConfig } from '../../../config/config';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { NerdmRes, NerdmComp } from '../../../nerdm/nerdm';
import { DataCart, DataCartItem } from '../../../datacart/cart';
import { DownloadStatus } from '../../../datacart/cartconstants';
import { DataCartStatus } from '../../../datacart/cartstatus';
import { formatBytes } from '../../../utils';
import { EditStatusService } from '../../../landing/editcontrol/editstatus.service';
import { LandingConstants } from '../../../shared/globals/globals';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import {
    SectionPrefs,
    Sections,
    GlobalService,
    TreeNode,
} from "../../../shared/globals/globals";
import { LandingpageService } from '../../landingpage.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatafilesPubComponent } from '../datafiles-pub/datafiles-pub.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faRefresh, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";

declare var _initAutoTracker: Function;

@Component({
  selector: "lib-datafiles-midas",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatafilesPubComponent,
    FontAwesomeModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: "./datafiles-midas.component.html",
  styleUrls: [
    "../../landing.component.scss",
    "../data-files.component.css",
    "./datafiles-midas.component.css",
  ],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({
          height: "0px",
          opacity: 0,
          overflow: "hidden",
        }),
      ),

      state(
        "expanded",
        style({
          height: "*",
          opacity: 1,
          overflow: "hidden",
        }),
      ),

      transition("expanded <=> collapsed", animate("250ms ease-in-out")),
    ]),
  ],
})
export class DatafilesMidasComponent {
  @Input() record: NerdmRes;
  @Input() inBrowser: boolean; // false if running server-side

  // Flag to tell if this is a publishing platform
  @Input() editEnabled: boolean; //Disable download all functionality if edit is enabled
  @Input() isEditMode: boolean;
  // Download status to trigger metrics refresh in parent component
  @Output() dlStatus: EventEmitter<string> = new EventEmitter();

  ediid: string = "";
  files: TreeNode[] = []; // the hierarchy of collections and files
  fileCount: number = 0; // number of files being displayed
  downloadStatus: string = ""; // the download status for the dataset collection as a whole
  globalDataCart: DataCart = null;
  dataCartStatus: DataCartStatus;
  allInCart: boolean = false;
  isAddingToDownloadAllCart: boolean = false;
  isTogglingAllInGlobalCart: boolean = false;
  isPublicSite: boolean = false;

  cols: any[];
  fileNode: any; // the node whose description has been opened
  isExpanded: boolean = false;
  visible: boolean = true;
  cartLength: number;
  showZipFileNames: boolean = false; // zip file display is currently disabled
  showDownloadProgress: boolean = false;
  appWidth: number = 800; // default value used in server context
  appHeight: number = 900; // default value used in server context
  fontSize: string = "16px";
  EDIT_MODES: any;
  editMode: string;
  mobileMode: boolean = false;
  hashCopied: boolean = false;
  fileManagerUrl: string = "https://nextcloud-dev.nist.gov";
  fileManagerBaseUrl: string = "https://nextcloud-dev.nist.gov";
  fieldName: string = SectionPrefs.getFieldName(Sections.AUTHORS);
  refreshFilesIcon: string = "faa faa-repeat fa-1x icon-white";
  // revisionType: string = ""
  // arrRevisionTypes: any[] = [];
  EDIT_TYPES: any = LandingConstants.editTypes;
  authorized: boolean = false;

  // The key of treenode whose details is currently displayed
  currentKey: string = "";

  //icon class names
  faCircleInfo = faCircleInfo;
  faRefresh = faRefresh;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  mouseOver: boolean = false;
  largeFileManagerExpanded: boolean = false;

  constructor(
    private cfg: AppConfig,
    public editstatsvc: EditStatusService,
    public breakpointObserver: BreakpointObserver,
    public mdupdsvc: MetadataUpdateService,
    public lpService: LandingpageService,
    private msgsvc: UserMessageService,
    private chref: ChangeDetectorRef,
    public globalService: GlobalService,
  ) {
    this.cols = [
      { field: "name", header: "Name", width: "60%" },
      { field: "mediaType", header: "Media Type", width: "auto" },
      { field: "size", header: "Size", width: "auto" },
      { field: "download", header: "Status", width: "auto" },
    ];

    this.mdupdsvc.watchFileManagerUrl((fileManagerUrl) => {
      if (fileManagerUrl) {
        this.fileManagerUrl = fileManagerUrl;
      }
    });
  }

  ngOnInit() {
    // this.arrRevisionTypes = LandingConstants.reviseTypes;
    // if(this.record && !this.record["keyword"]) this.record["keyword"] = [];

    this.editstatsvc.watchEditMode((editMode) => {
      this.editMode = editMode;
    });

    this.globalService.watchAuthorized((authorized) => {
      this.authorized = authorized;
    });

    // Bootstrap breakpoint observer (to switch between desktop/mobile mode)
    this.breakpointObserver
      .observe(["(min-width: 766px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.mobileMode = false;
        } else {
          this.mobileMode = true;
        }
      });

    if (this.inBrowser) {
      // this.appHeight = (window.innerHeight);
      // this.appWidth = (window.innerWidth);
      // this.setWidth(this.appWidth);
      // this.globalDataCart = this.cartService.getGlobalCart();
      // this.cartLength = this.globalDataCart.size();
      // this.globalDataCart.watchForChanges((ev) => { this.cartChanged(); })
      // this.dataCartStatus = DataCartStatus.openCartStatus();
    }

    // if (this.record)
    //     this.useMetadata();
  }

  get fileManagerTooltip() {
    if (this.fileManagerUrl) return this.fileManagerUrl;
    else return "File Manager URL is not available.";
  }

  ngOnChanges(ch: SimpleChanges) {
    this.chref.detectChanges();
  }

  /**
   * Open url in a new tab
   */
  openFileManager() {
    window.open(this.fileManagerUrl);
  }

  /**
   * Reload data files
   */
  reloadFiles() {
    this.refreshFilesIcon = "faa faa-spinner faa-spin icon-white";
    this.mdupdsvc.syncDataFiles().subscribe({
      next: (fsdata) => {
        this.mdupdsvc.loadDraft(true).subscribe({
          next: (md) => {
            if (md) {
              this.mdupdsvc.cacheMetadata(md as NerdmRes);
              this.mdupdsvc.checkUpdatedFields(md as NerdmRes);

              if (md["components"])
                this.record["components"] = JSON.parse(
                  JSON.stringify(md["components"]),
                );
              else this.record["components"] = [];

              // this.buildTree(this.record['components']); // Will rebuild in pub component
            } else {
              this.msgsvc.error("Fail to retrive updated dataset.");
            }
            this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
          },
          error: (err) => {
            console.error("Failed to pull updated record: ", err);
            this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
          },
        });
      },
      error: (err) => {
        console.error("Failed to trigger file sync: ", err);
        this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
      },
    });
  }

  /**
   * Emit download status
   * @param downloadStatus
   */
  setDownloadStatus(downloadStatus) {
    this.dlStatus.emit(downloadStatus);
  }

  /**
   * Button style
   * @returns
   */
  btnStyle() {
    // let color = this.allCollections[this.collection].colorPalette;

    return {
      "--button-text-color": "white",
      "--button-color": "var(--nist-green-default)",
      "--hover-color": "var(--nist-green-hover)",
      "--disable-color": "var(--disabled-grey)",
      "--disable-text-color": "var(--disabled-grey-text)",
      "margin-bottom": ".5em",
      width: "200px",
    };
  }
}
