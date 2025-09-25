import { Component, Input, Output, NgZone, OnInit, OnChanges, SimpleChanges, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TreeNode } from 'primeng/api';
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
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { SectionPrefs, Sections, GlobalService } from '../../../shared/globals/globals';
import { LandingpageService } from '../../landingpage.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { UserMessageService } from '../../../frame/usermessage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeTableModule } from 'primeng/treetable';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FrameModule } from '../../../frame/frame.module';
import { DataFileItem } from '../data-files-to-be-deleted.component';
import { DatafilesPubComponent } from '../datafiles-pub/datafiles-pub.component';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

declare var _initAutoTracker: Function;

@Component({
    selector: 'lib-datafiles-midas',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        BadgeModule,
        TreeTableModule, 
        OverlayPanelModule, 
        ProgressSpinnerModule, 
        ButtonModule, 
        TooltipModule, 
        NgbModule,
        DatafilesPubComponent
    ],
    templateUrl: './datafiles-midas.component.html',
    styleUrls: [
        '../../landing.component.scss', 
        '../data-files.component.css',
        './datafiles-midas.component.css'
    ]
})
export class DatafilesMidasComponent {

    @Input() record: NerdmRes;
    @Input() inBrowser: boolean;   // false if running server-side

    // Flag to tell if this is a publishing platform
    @Input() editEnabled: boolean;    //Disable download all functionality if edit is enabled
    @Input() isEditMode: boolean;
    // Download status to trigger metrics refresh in parent component
    @Output() dlStatus: EventEmitter<string> = new EventEmitter();  

    ediid: string = '';
    files: TreeNode[] = [];           // the hierarchy of collections and files
    fileCount: number = 0;            // number of files being displayed
    downloadStatus: string = '';      // the download status for the dataset collection as a whole
    globalDataCart: DataCart = null;
    dataCartStatus: DataCartStatus;
    allInCart: boolean = false;
    isAddingToDownloadAllCart: boolean = false;
    isTogglingAllInGlobalCart: boolean = false;

    cols: any[];
    fileNode: any;               // the node whose description has been opened
    isExpanded: boolean = false;
    visible: boolean = true;
    cartLength: number;
    showZipFileNames: boolean = false;    // zip file display is currently disabled
    showDownloadProgress: boolean = false;
    appWidth: number = 800;   // default value used in server context
    appHeight: number = 900;  // default value used in server context
    fontSize: string = "16px";
    EDIT_MODES: any;
    editMode: string;
    mobileMode: boolean = false;
    hashCopied: boolean = false;
    fileManagerUrl: string = 'https://nextcloud-dev.nist.gov';
    fileManagerBaseUrl: string = 'https://nextcloud-dev.nist.gov';
    fieldName: string = SectionPrefs.getFieldName(Sections.AUTHORS);
    overlaypanelOn: boolean = false;
    refreshFilesIcon: string = "faa faa-repeat fa-1x icon-white";
    // revisionType: string = ""
    // arrRevisionTypes: any[] = [];
    _editType: string;
    EDIT_TYPES: any = LandingConstants.editTypes;
    authorized: boolean = false;

    // The key of treenode whose details is currently displayed
    currentKey: string = '';
        
    constructor(private cfg: AppConfig,
                public editstatsvc: EditStatusService,
                public breakpointObserver: BreakpointObserver,
                public mdupdsvc : MetadataUpdateService, 
                public lpService: LandingpageService, 
                private msgsvc: UserMessageService,
                private chref: ChangeDetectorRef,
                public globalService: GlobalService,
                private confirmDialogSvc: ConfirmationDialogService,
                private ngZone: NgZone)
    {
        this.cols = [
            { field: 'name', header: 'Name', width: '60%' },
            { field: 'mediaType', header: 'Media Type', width: 'auto' },
            { field: 'size', header: 'Size', width: 'auto' },
            { field: 'download', header: 'Status', width: 'auto' }];

        // if (typeof (window) !== 'undefined') {
        //     window.onresize = (e) => {
        //         ngZone.run(() => {
        //             this.appWidth = window.innerWidth;
        //             this.appHeight = window.innerHeight;
        //             this.setWidth(this.appWidth);
        //         });
        //     };
        // }
        
        this.EDIT_MODES = LandingConstants.editModes;
        this.fileManagerBaseUrl = this.cfg.get("fileManagerAPI", "https://nextcloud-dev.nist.gov");

        this.mdupdsvc.watchFileManagerUrl((fileManagerUrl) => {
            if (fileManagerUrl) {
                this.fileManagerUrl = fileManagerUrl;
            }
        });
    }

    // get isRevisionType() {
    //     return this._editType == this.EDIT_TYPES.REVISE;
    // }

    ngOnInit() {
        // this.arrRevisionTypes = LandingConstants.reviseTypes;
        // if(this.record && !this.record["keyword"]) this.record["keyword"] = [];

        this.editstatsvc.watchEditMode((editMode) => {
            this.editMode = editMode;
        });

        this.globalService.watchAuthorized((authorized) => {
            this.authorized = authorized;
        })

        // this.editstatsvc.watchReviseType((revisionType) => {
        //     this.revisionType = revisionType;
        //     this.chref.detectChanges();
        //     console.log(!this.authorized || this.isRevisionType && revisionType == this.arrRevisionTypes[0].type);
        // })

        this.editstatsvc.watchEditType((editType) => {
            this._editType = editType;
        })

        // Bootstrap breakpoint observer (to switch between desktop/mobile mode)
        this.breakpointObserver
        .observe(['(min-width: 766px)'])
        .subscribe((state: BreakpointState) => {
            if (state.matches) {
                this.mobileMode = false;
            } else {
                this.mobileMode = true;
            }
        });

        if(this.inBrowser){
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

    get fileManagerTooltip(){
        if(this.fileManagerUrl) return this.fileManagerUrl;
        else return "File Manager URL is not available."
    }

    ngOnChanges(ch: SimpleChanges) {
        this.chref.detectChanges();
    }

    /**
     * Open url in a new tab
     */
    openFileManager() {
        window.open(this.fileManagerUrl);

        // if (this.isRevisionType && this.revisionType == "Metadata Update") {
        //     let message = "Current revision type is 'Metadata Update'. Would you like to select a type from following and proceed?";

        //     this.confirmDialogSvc.confirmManageFiles(
        //         'Please confirm',
        //         message, 'sm')
        //         .then((confirmed) => {
        //             if (confirmed) {
        //                 this.revisionType = this.arrRevisionTypes[4];
        //                 window.open(this.fileManagerUrl);
        //             }
        //         })
        //         .catch(() => {
        //             console.log("User canceled request (indirectly)");
        //         });
        // }     
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
                        if(md) {
                            this.mdupdsvc.cacheMetadata(md as NerdmRes);
                            this.mdupdsvc.checkUpdatedFields(md as NerdmRes);

                            if (md['components']) 
                                this.record['components'] = JSON.parse(JSON.stringify(md['components']));
                            else
                                this.record['components'] = []
                        
                            // this.buildTree(this.record['components']); // Will rebuild in pub component
                        }else{
                            this.msgsvc.error("Fail to retrive updated dataset.");
                        }
                        this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
                    },
                    error: (err) => {
                        console.error("Failed to pull updated record: ", err);
                        this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
                    }
                });
            },
            error: (err) => {
                console.error("Failed to trigger file sync: ", err);
                this.refreshFilesIcon = "faa faa-repeat fa-1x icon-white";
            }
        });
    }

    /**
     * discard the latest changes after receiving confirmation via a modal pop-up.  This will revert 
     * the data to its previous state.
     */
    public showLargeFileManagerHelpPopup(event, overlaypanel: OverlayPanel): void {
        if(!this.overlaypanelOn){
            overlaypanel.hide();
            setTimeout(() => {
                overlaypanel.show(event);
                this.overlaypanelOn = true;
                this.chref.detectChanges();
            }, 100);    
        }else{
            overlaypanel.hide();
            setTimeout(() => {
                this.chref.detectChanges();
            }, 0);
        }
    }    

    onHide() {
        this.overlaypanelOn = false;
        setTimeout(() => {
            this.chref.detectChanges();
        }, 0);
    }

    hideOverlay(event, overlaypanel: OverlayPanel) {
        console.log("event", event);
        
        overlaypanel.hide();
        this.overlaypanelOn = false;

        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            event.chref.detectChanges();
        },0);          
    }

    /**
     * Emit download status
     * @param downloadStatus
     */
    setDownloadStatus(downloadStatus){
        this.dlStatus.emit(downloadStatus);
    }    
}
