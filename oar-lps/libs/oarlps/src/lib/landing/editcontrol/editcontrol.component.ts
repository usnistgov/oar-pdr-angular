import { Component, OnInit, OnChanges, ViewChild, Input, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { UserMessageService } from '../../frame/usermessage.service';
import { MessageBarComponent } from '../../frame/messagebar.component';
import { EditStatusComponent } from './editstatus.component';
import { MetadataUpdateService } from './metadataupdate.service';
import { EditStatusService } from './editstatus.service';
import { AuthService, WebAuthService } from './auth.service';
import { CustomizationService } from './customization.service';
import { NerdmRes } from '../../nerdm/nerdm'
import { AppConfig } from '../../config/config';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { deepCopy } from '../../config/config.service';
import { LandingConstants, SubmitResponse } from '../../shared/globals/globals';
import { LandingpageService } from '../landingpage.service';
import * as REVISION_TYPES from '../../../assets/site-constants/revision-types.json';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SubmitConfirmComponent } from './submit-confirm/submit-confirm.component';
import { CollectionService } from '../../shared/collection-service/collection.service';
import { Themes, ThemesPrefs, Collections, Collection, CollectionThemes, FilterTreeNode, ColorScheme, GlobalService } from '../../shared/globals/globals';
import * as CollectionData from '../../../assets/site-constants/collections.json';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { ConfirmationDialogModule } from '../../shared/confirmation-dialog/confirmation-dialog.module';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { createAuthService } from './auth.service';

/**
 * a panel that serves as a control center for editing metadata displayed in the 
 * landing page.  Features include:
 *  * a bar of buttons for turning on editing, saving changes, and discarding changes
 *  * a bar for displaying the current status of the editing
 *  * a bar for displaying error messages.  
 * 
 * This component also houses the business logic for managing metadata editing, including 
 * orchestrating authentication and authorization.  
 */
@Component({
    selector: 'pdr-edit-control',
    standalone: true,
    imports: [
        CommonModule, 
        ConfirmationDialogModule, 
        ButtonModule, 
        OverlayPanelModule, 
        NgbModule, 
        NgSelectModule, 
        FormsModule,
        EditStatusComponent,
        SubmitConfirmComponent
    ],
    templateUrl: './editcontrol.component.html',
    styleUrls: ['./editcontrol.component.css']
})
export class EditControlComponent implements OnInit, OnChanges {

    private _custsvc: CustomizationService = null;
    private originalRecord: NerdmRes = null;
    _editMode: string;
    EDIT_TYPES: any = LandingConstants.editTypes;
    _editType: string;
    EDIT_MODES: any;
    screenWidth: number;
    screenSizeBreakPoint: number;
    fileManagerUrl: string = 'https://nextcloud-dev.nist.gov';
    portalURL: string;
    arrRevisionTypes: any[] = [];
    revisionType: string;
    submitResponse: SubmitResponse = {} as SubmitResponse;
    mobileMode: boolean = false;
    modalRef: any; // For submit pop up
    imageURL: string = '';
    collection: string;
    collectionObj: any;
    message: string = "test";

    /**
     * the local copy of the draft (updated) metadata.  This parameter is available to a parent
     * template via [(mdrec)].
     */
    @Input() mdrec: NerdmRes;
    // @Output() mdrecChange = new EventEmitter<NerdmRes>();

    /**
     * the ID that was used to request the landing page
     */
    @Input() requestID: string;

    /**
     * the original resource identifier
     */
    private _resid: string = null;
    get resID() { return this._resid; }
    set resID(resID: string) { this._resid = resID; }

    @Input() inBrowser: boolean = false;

    // injected as ViewChilds so that this class can send messages to it with a synchronous method call.
    @ViewChild(EditStatusComponent, { static: true })
    private statusbar: EditStatusComponent;

    @ViewChild(MessageBarComponent, { static: true })
    private msgbar: MessageBarComponent;

    /**
     * create the component
     *
     * @param mdupdsvc           a MetadataUpdateService used to receive updates from editing widgets
     * @param authsvc            a AuthService used for interacting with the customization web service
     *                           (this service will provide the CustomizationService for updating 
     *                           metadata).
     * @param confirmDialogSvc   a ConfirmationDialogService for displaying pop-up confirmation windows 
     *                           (provided by local injector)
     * @param msgsvc             a UserMessageService used to receive messages for display in the error 
     *                           message bar
     */
    public constructor(private mdupdsvc: MetadataUpdateService,
        public edstatsvc: EditStatusService,
        // private authsvc: AuthService,
        private confirmDialogSvc: ConfirmationDialogService,
        private cfg: AppConfig,
        public lpService: LandingpageService, 
        private chref: ChangeDetectorRef,
        private modalService: NgbModal,
        public globalService: GlobalService,
        private msgsvc: UserMessageService) {

        this.globalService.watchCollection((collection) => {
            this.collection = collection;
            this.loadBannerUrl();
        });

        this.globalService.watchMessage((message) => {
            this.message = message;
            //Display message for 3 seconds
            setTimeout(() => {
                this.message = "";
            }, 3000);
        });

        this.EDIT_MODES = LandingConstants.editModes;
        this.mdupdsvc.subscribe(
            (md) => {
                if (md && md != this.mdrec) {
                    if(md && !md["keyword"]) md["keyword"] = [];
                    this.mdrec = md as NerdmRes;
                    this.edstatsvc._setLastUpdated(this.mdupdsvc.lastUpdate);
                    // this.mdrecChange.emit(md as NerdmRes);
                }
            }
        );

        this.edstatsvc._setLastUpdated(this.mdupdsvc.lastUpdate);
        this.edstatsvc._setAuthorized(this.isAuthorized());
        this.edstatsvc._setUserID(this.mdupdsvc.authsvc.userID);
        this.screenSizeBreakPoint = +this.cfg.get("screenSizeBreakPoint", "768");
        this.portalURL = this.cfg.get("portalAPI", "https://mdsdev.nist.gov/portal/landing");
    }

    ngOnInit() {
        let i = 0;
        // Object.keys(REVISION_TYPES).map((key) => {
        //     this.arrReviseTypes.push({id:i++, type: this.reviseTypes[key]});
        // });

        this.arrRevisionTypes = REVISION_TYPES["default"];
        // set edit mode to view only on init
        // this._setEditMode(this.EDIT_MODES.VIEWONLY_MODE);
        this.ngOnChanges();
        this.edstatsvc._watchRemoteStart((remoteObj) => {
            // To remote start editing, resID need be set otherwise authorizeEditing()
            // will do nothing and the app won't change to edit mode
            if (remoteObj.resID) {
                this.resID = remoteObj.resID;
                this.startEditing(remoteObj.nologin);
            }
        });

        this.mdupdsvc.watchFileManagerUrl((fileManagerUrl) => {
            if (fileManagerUrl) {
                this.fileManagerUrl = fileManagerUrl;
            }
        });     
        
        this.lpService.watchSubmitResponse((response) => {
            this.submitResponse = response;
        })

        this.edstatsvc.watchReviseType((revisionType) => {
            this.revisionType = revisionType;
        })
        
        this.edstatsvc.watchEditMode((editMode) => {
            this._editMode = editMode;
        })

        this.edstatsvc.watchEditType((editType) => {
            this._editType = editType;
        })

        this.lpService.watchMobileMode((response) => {
            this.mobileMode = response;
        })
    }

    ngOnChanges() {
        if (this.mdrec instanceof Object && Object.keys(this.mdrec) && Object.keys(this.mdrec).length > 0) {
            if (!this.resID)
                this._resid = this.mdrec['ediid'];
            if (this.originalRecord === null) {
                this.originalRecord = deepCopy(this.mdrec) as NerdmRes;
                //Should not change original rec when record changed. Only after submit or discard changes
                // this.mdupdsvc.setOriginalMetadata(this.originalRecord)
            }
        }
    }

    loadBannerUrl() {
        this.collectionObj = CollectionData[this.collection] as any;

        switch(this.collection) {
            case Collections.FORENSICS: {
                this.imageURL = this.collectionObj.bannerUrl;
                break;
            }
            case Collections.SEMICONDUCTORS: {
                this.imageURL = this.collectionObj.bannerUrl;
                break;
            }
            default: {
                this.imageURL = "";
                break;
            }
        }

        setTimeout(() => {
            // this.displayBanner = true;
        }, 0);
    }

    /**
     *  Following functions detect screen size
     */
    @HostListener("window:resize", [])
    public onResize() {
        this.detectScreenSize();
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.detectScreenSize();
        });
    }

    private detectScreenSize() {
        if(this.inBrowser)
            this.screenWidth = window.innerWidth;
        else
            this.screenWidth = 500; 
    }

    get isRevisionMode() {
        return this._editMode == this.EDIT_MODES.EDIT_MODE && this._editType == this.EDIT_TYPES.REVISE;
    }

    // setReviseType(type: any) {
        // this.edstatsvc.setReviseType(type.type);
    // }

    /**
     * flag indicating whether the current editing mode of the landing page.  
     * @param editmode   
     */
    _setEditMode(editmode : string){
        this._editMode = editmode;
        //broadcast the editmode
        this.edstatsvc.editMode.set(editmode);
        this.edstatsvc._setEditMode(editmode);
        this.chref.detectChanges();
    }

    /**
     * 
     * @param nologin Return current mode string for display
     */
    get currentMode(){
        let returnString: string = "";
        switch(this._editMode) { 
            case this.EDIT_MODES.EDIT_MODE: { 
                if(this._editType == this.EDIT_TYPES.NORMAL)
                    returnString = "EDIT MODE";
                else if(this._editType == this.EDIT_TYPES.REVISE)
                    returnString = "REVISION MODE";

                break; 
            } 
            case this.EDIT_MODES.PREVIEW_MODE: { 
                returnString = "PREVIEW MODE";
                break; 
            } 
            case this.EDIT_MODES.DONE_MODE: { 
                returnString = "DONE MODE";
                break; 
            } 
            default: { 
                break; 
            } 
        } 

        return returnString;
    }

    get editModeTooltip() {
        let returnString: string = "";
        switch(this._editMode) { 
            case this.EDIT_MODES.EDIT_MODE: { 
                if(this._editType == this.EDIT_TYPES.NORMAL)
                    returnString = "EDIT MODE";
                else if(this._editType == this.EDIT_TYPES.REVISE)
                    returnString = "REVISION MODE";
                break; 
            } 
            case this.EDIT_MODES.PREVIEW_MODE: { 
                returnString = "PREVIEW MODE";
                break; 
            } 
            case this.EDIT_MODES.DONE_MODE: { 
                returnString = "DONE MODE";
                break; 
            } 
            default: { 
                break; 
            } 
        } 

        return returnString;
    }

    get editModeIconClass() {
        let returnString: string = "";
        switch(this._editMode) { 
            case this.EDIT_MODES.EDIT_MODE: { 
                if(this._editType == this.EDIT_TYPES.NORMAL)
                    returnString = "fa-pencil";
                else if(this._editType == this.EDIT_TYPES.REVISE)
                    returnString = "fa-undo";
                break; 
            } 
            case this.EDIT_MODES.PREVIEW_MODE: { 
                returnString = "fa-eye";
                break; 
            } 
            case this.EDIT_MODES.DONE_MODE: { 
                returnString = "fa-check";
                break; 
            } 
            default: { 
                break; 
            } 
        } 

        return returnString;
    }

    get readySubmit() {
        return !this.hasRequiredItems;
    }

    get fileManagerTooltip(){
        if(this.fileManagerUrl) return this.fileManagerUrl;
        else return "File Manager URL is not available."
    }

    get hasRequiredItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.failures &&  this.submitResponse.validation.failures.length > 0;
    }

    get hasRecommendedItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.warnings &&  this.submitResponse.validation.warnings.length > 0;
    }

    get hasNiceToHaveItems() {
        return this.submitResponse && this.submitResponse.validation && this.submitResponse.validation.recommendations &&  this.submitResponse.validation.recommendations.length > 0;
    }

    /**
     * start (or resume) editing of the resource metadata.  Calling this will cause editing widgets to 
     * appear on the landing page, allowing the user to edit various fields.
     * 
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  the app will remain with editing turned off if the user is not logged in.  
     */
    public startEditing(nologin: boolean = false): void {
      if(this.inBrowser){
        var _mdrec = this.mdrec;
        if (this._custsvc) {
            // already authorized
            this.edstatsvc.setShowLPContent(true);
            this._setEditMode(this.EDIT_MODES.EDIT_MODE);
            return;
        }

        this.authorizeEditing(nologin).subscribe(
            (successful) => {
              // User authorized
              if(successful){
                console.log("Loading draft...");
                // this.statusbar.showMessage("Loading draft...", true);
                this.globalService.message.set("Loading draft......");
                this.mdupdsvc.loadDraft().subscribe(
                    (md) => 
                    {
                        if(md)
                        {
                            console.log("Draft loaded.");
                            this.globalService.message.set("");
                            this.mdupdsvc.setOriginalMetadata(md as NerdmRes);
                            this.mdupdsvc.checkUpdatedFields(md as NerdmRes);
                            this._setEditMode(this.EDIT_MODES.EDIT_MODE);
                            this.edstatsvc.setShowLPContent(true);
                        }else{
                        // this.statusbar.showMessage("There was a problem loading draft data.", false);
                        // this._setEditMode(this.EDIT_MODES.PREVIEW_MODE);
                        // this.edstatsvc._setError(true);
                        }
                    },
                    (err) => 
                    {
                        if(err.statusCode == 404)
                        {
                            console.error("404 error.");
                            this.edstatsvc.setShowLPContent(true);
                            this.mdupdsvc.resetOriginal();
                            // this.statusbar.showMessage("", false)
                            this._setEditMode(this.EDIT_MODES.OUTSIDE_MIDAS_MODE);
                        }
                    }
                );
              }
            },
            (err) => {
                console.error("Authentication failed.");
                this.edstatsvc.setShowLPContent(true);
                this._setEditMode(this.EDIT_MODES.PREVIEW_MODE);
                this.statusbar.showMessage("Authentication failed.");
                // this.globalService.setMessage("Authentication failed.");
            }
        );
      }
    }

    /**
     * discard the edits made so far
     */
    public discardEdits(): void {
        if (this._custsvc) {
            this._custsvc.discardDraft().subscribe({
                next: (md) => {
                    // console.log("Discard edit return:", md);
                    this.mdupdsvc.forgetUpdateDate();
                    this.mdupdsvc.fieldReset();
                    this._setEditMode(this.EDIT_MODES.PREVIEW_MODE);
                    if (md && md['@id']) {
                        // assume a NerdmRes object was returned
                        this.mdrec = md as NerdmRes;
                        this.mdupdsvc.setOriginalMetadata(md as NerdmRes);
                        // this.mdrecChange.emit(md as NerdmRes);
                    }else{
                      // If backend didn't return a Nerdm record, just set edit mode to preview
                      console.log("Backend didn't return a Nerdm record after the discard request.")
                      this._setEditMode(this.EDIT_MODES.PREVIEW_MODE);
                    }
                },
                error: (err) => {
                    if (err.type == "user")
                        this.msgsvc.error(err.message);
                    else {
                        console.error("error during discard: " + err.message)
                        this.msgsvc.syserror("error during discard: " + err.message)
                    }
                }
        });
        }
        else
            console.warn("Warning: requested edit discard without authorization");
    }

    /**
     * discard the latest changes after receiving confirmation via a modal pop-up.  This will revert 
     * the data to its previous state.
     */
    public confirmDiscardEdits(): void {
        var message = 'Edited data will be lost. Do you want to erase changes?';

        this.confirmDialogSvc.confirm(
            'Please confirm',
            message, true)
            .then((confirmed) => {
                if (confirmed)
                    this.discardEdits()
                else
                    console.log("User canceled discard request");
            })
            .catch(() => {
                console.log("User canceled discard request (indirectly)");
            });
    }

    /**
     * discard the latest changes after receiving confirmation via a modal pop-up.  This will revert 
     * the data to its previous state.
     */
    public showEditControlHelpPopup(event, overlaypanel: OverlayPanel): void {
        overlaypanel.hide();
        setTimeout(() => {
            overlaypanel.show(event);
        }, 100);
    }

    /**
     * Tell backend that the editing is done
     */
    public doneEdits(): void {
        window.open(this.portalURL, "_blank");
    //   if (this._custsvc){
    //     this._custsvc.doneEditing().subscribe(
    //       (res) => {
    //         // console.log("Done edit return:", res);
    //         this.mdupdsvc.forgetUpdateDate();
    //         this.mdupdsvc.fieldReset();
    //         this._setEditMode(this.EDIT_MODES.DONE_MODE);
    //       },
    //       (err) => {
    //         if (err.type == "user")
    //           this.msgsvc.error(err.message);
    //         else {
    //           this.msgsvc.syserror("error during save: " + err.message);
    //         }
    //       }
    //     );
    //   }
    }

    /**
     * pause the editing process: remove the editing widgets from the page so that the user can see how 
     * the changes will appear.  This function is called when the "Preview" button is clicked.
     */
    public preview(): void {
        this._setEditMode(this.EDIT_MODES.PREVIEW_MODE);
    }

    /**
     * return true if there are edits saved that have not be submitted
     */
    public editsPending(): boolean {
        return Boolean(this.mdupdsvc.lastUpdate);
    }

    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
    public isAuthorized(): boolean {
        return Boolean(this._custsvc);
    }

    /**
     * obtain authorization to edit the metadata and pass that authorization to the editing widgets.
     *
     * Authorization in this context mean a CustomizationService with a valid authorization token 
     * embedded in it.  The CustomizationService will be passed to the MetadataUpdateService so 
     * that it can send updates from the editing widgets to the remote customization web service.  
     *
     * Note that calling this method may cause the browser to redirect to an authorization server, 
     * and, thus, this function would not return to its caller.  The authorization server should 
     * return the browser to the landing page which should trigger calling this function again.  
     * 
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  false is returned if the user is not logged in.  
     * @return Observable<boolean>   this will resolve to true if the application is authorized; 
     *                               false, if either the user could not authenticate or is otherwise 
     *                               not allowed to edit this record.  
     */
    public authorizeEditing(nologin: boolean = false): Observable<boolean> {
        if (this._custsvc) return of<boolean>(true);   // We're already authorized
        if (!this.resID) {
            console.warn("Warning: Initial metadata record not established yet in EditControlComponent");
            return of<boolean>(false);
        }

        return new Observable<boolean>(subscriber => {
            console.log("obtaining editing authorization");
            this.statusbar.showMessage("Authenticating/authorizing access...", true)
            // this.globalService.setMessage("Authenticating/authorizing access...");

            this.mdupdsvc.authsvc.authorizeEditing(this.resID, nologin).subscribe(  // might cause redirect (see above)
                (custsvc) => {
                    // this.globalService.setMessage("");
                    this._custsvc = custsvc;    // could be null, indicating user is not authorized.
                    this.mdupdsvc._setCustomizationService(custsvc);

                    var msg: string = "";
                    var authenticated: boolean = false;

                    if (!this.mdupdsvc.authsvc.userID) {
                        msg = "authentication failed";
                        this.msgsvc.error("User log in cancelled or failed.")
                    }
                    else if (!custsvc) {
                        msg = "authorization denied for user " + this.mdupdsvc.authsvc.userID;
                        if(this.mdupdsvc.authsvc.errorMessage)
                            this.msgsvc.error(this.mdupdsvc.authsvc.errorMessage);
                        else    // Default message
                            this.msgsvc.error("Sorry, you are not authorized to edit this submission.")
                    }
                    else{
                        msg = "authorization granted for user " + this.mdupdsvc.authsvc.userID;
                        authenticated = true;
                    }

                    console.log(msg);
                    this.statusbar.showMessage(msg, false); 
                    // this.globalService.setMessage(msg);

                    if(authenticated){
                      subscriber.next(Boolean(this._custsvc));
                      this.edstatsvc._setUserID(this.mdupdsvc.authsvc.userID);
                      this.edstatsvc._setAuthorized(true);
                    }else{
                      subscriber.next(false);
                      this.edstatsvc._setAuthorized(false);
                      this.edstatsvc._setEditMode(this.EDIT_MODES.PREVIEW_MODE)
                    }
                    
                    subscriber.complete();
                },
                (err) => {
                    let msg = "Failure during authorization: " + err.message;
                    this.statusbar.showMessage(msg, false); 
                    // this.globalService.setMessage(msg);
                    console.error(msg);
                    this.msgsvc.syserror(msg);
                    subscriber.next(false);
                    subscriber.complete();
                    this.edstatsvc._setAuthorized(false);
                    this.edstatsvc._setEditMode(this.EDIT_MODES.PREVIEW_MODE)
                }
            );
        });
    }

    /**
     * Open url in a new tab
     */
    openFileManager() {
        window.open(this.fileManagerUrl);
    }

    submitReview() {
        console.log("Submit for review...")

        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "modal-small",
            size: 'lg'
        };

        this.modalRef = this.modalService.open(SubmitConfirmComponent, ngbModalOptions);
        this.modalRef.componentInstance.submitResponse = this.submitResponse;
        // this.modalRef.componentInstance.zipData = this.zipData;
        // this.modalRef.componentInstance.totalFiles = blob.filesCount;
        this.modalRef.componentInstance.returnValue.subscribe((returnValue) => {
            if ( returnValue ) {
                console.log("Return value", returnValue);
            }else{
                console.log("User canceled submit.");
            }
        }, (reason) => {
            console.log("User canceled submit.");
        });
    }
}
