import { Injectable, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';

import { UserMessageService } from '../../frame/usermessage.service';
import { CustomizationService } from './customization.service';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { Observable, of, throwError, Subscriber } from 'rxjs';
import { UpdateDetails, DBIOrecord } from './interfaces';
import { AuthService, WebAuthService } from './auth.service';
import { LandingConstants } from '../constants';
import { EditStatusService } from './editstatus.service';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';

/**
 * a service that receives updates to the resource metadata from update widgets.
 * 
 * This service mediates the updates between user-facing editing widgets, the 
 * CustomizationService (which saves updates in "draft" record stored on the server), 
 * and a controller object--namely, the EditControlPanel--that handles updating the 
 * resource metadata used to drive the landing page display.  In particular, editing
 * widgets send their metadata updates to this class (via update()); this class will 
 * then forward the changes to the CustomizationService and forward the full, updated 
 * record to the controller object.
 *
 * This class also works with a UserMessageService to alert the user with messages when 
 * things go wrong.  
 */
@Injectable()
export class MetadataUpdateService {

    private mdres: Subject<NerdmRes> = new Subject<NerdmRes>();
    private custsvc: CustomizationService = null;
    private originalDraftRec: NerdmRes = null;  //
    private currentRec: NerdmRes = null;    //Current saved record
    private origfields: {} = {};   // keeps track of orginal metadata so that they can be undone
    public  EDIT_MODES: any;
    _dbioRecord: DBIOrecord = null;

    private _lastupdate: UpdateDetails = {} as UpdateDetails;   // null object means unknown
    get lastUpdate() { return this._lastupdate; }
    set lastUpdate(updateDetails: UpdateDetails) {
        this._lastupdate = updateDetails;
        this.updated.emit(this._lastupdate);
    }

    private _fileManagerUrl: BehaviorSubject<string> = new BehaviorSubject<string>("");
    
    /**
     * Set the number of files downloaded
     * @param fileDownloadedCount 
     */
    setFileManagerUrl(fileManagerUrl: string) {
        this._fileManagerUrl.next(fileManagerUrl);
    }

    /**
     * Watch the number of files downloaded
     * @param subscriber 
     */
    watchFileManagerUrl(subscriber) {
        return this._fileManagerUrl.subscribe(subscriber);
    }


    /**
     * any Observable that will send out the date of the last update each time the metadata
     * is updated via this service.  If the date is an empty string, there are no updates 
     * pending for submission.  
     */
    public updated: EventEmitter<UpdateDetails> = new EventEmitter<UpdateDetails>();

    /**
     * a flag that indicates that whether the landing page is in edit mode, i.e. displays 
     * buttons for editing individual bits of metadata.  
     *
     * Note that this flag should only be updated by the controller (i.e. EditControlComponent) 
     * that subscribes to this class (via _subscribe()).
     */
    private editMode: string;
    // get editMode() { return this.editMode; }
    // set editMode(engage: string) { this.editMode = engage; }

    /**
     * construct the service
     * 
     * @param custsvc   the CustomizationService to use to send updates to the 
     *                  server.  
     */
    constructor(private msgsvc: UserMessageService,
        private edstatsvc: EditStatusService,
        public authsvc: AuthService,
        private datePipe: DatePipe) { 
          this.EDIT_MODES = LandingConstants.editModes;

          this.edstatsvc.watchEditMode((editMode) => {
            this.editMode = editMode;
          });
        }

    /*
     * subscribe to updates to the metadata.  This is intended for connecting the 
     * service to the EditControlPanel.
     */
    public subscribe(controller): void {
        this.mdres.subscribe(controller);
    }

    public setOriginalMetadata(md: NerdmRes) {
        this.currentRec = JSON.parse(JSON.stringify(md));
        this.mdres.next(md as NerdmRes);
    }

    public resetOriginal() {
      this.mdres.next(JSON.parse(JSON.stringify(this.currentRec)) as NerdmRes);
    }

    _setCustomizationService(svc: CustomizationService): void {
        this.custsvc = svc;
    }

    /**
     * update the resource metadata.
     * 
     * The given object will be merged into the resource metadata.  The update will be 
     * sent to the server, and the full and updated version of the metadata will be 
     * sent to the metadata controller.
     *
     * To facilitate the undo capability, updates are associated with a name--the subsetname-- 
     * that is unique to the client component requesting the update.  When the client is 
     * updating a single property, the name is typically the name of the property; if a client
     * updates multiple property, some other name can be used.  A client can roll back the 
     * updates it requested via undo() by using the same name that identifies portion of the 
     * data to undo.  This framework assumes that no two clients update the same metadata 
     * property.  
     *
     * @param subsetname  a label that distinguishes the metadata properties being set 
     *             by this call.  Typically, this is the same name as the single property 
     *             being updated; however, if multiple properties are being updated, this 
     *             name can be an arbitrary label.  
     * @param md   an object containing the portion of the resource metadata that 
     *             should be updated.  
     * @param id   Component id. If provided, only update specific @id.
     * @param subsetnameAPI the API that appends to default URL to make update call.
     * @return Promise<boolean>  -  result is true if the update was successful, false if 
     *             there was an issue.  Note that the underlying CustomizationService will
     *             take care of reporting the reason.  This allows the caller in charge of 
     *             getting updates to have its UI react accordingly.
     */
    public update(subsetname: string, md: {}, id: string = undefined, subsetnameAPI: string = undefined): Promise<boolean> {
        let body: any;
        let updateWholeRecord: boolean = false;
        let fieldName = subsetname.split("-")[0];

        if(!subsetnameAPI) subsetnameAPI = fieldName;
  
        if (!this.custsvc) {
            console.error("Attempted to update without authorization!  Ignoring update.");
            return new Promise<boolean>((resolve, reject) => {
                resolve(false);
            });
        }

        // establish the original state for this subset of metadata (so that it this update
        // can be undone).
        let key = id? subsetname + id : subsetname;
        if (this.currentRec) {
            if (!this.origfields[key])
                this.origfields[key] = {};

            for (let realProp in md) {
                if (this.origfields[key][realProp] === undefined) {
                    if (this.currentRec[realProp] !== undefined) {
                        this.origfields[key][realProp] = JSON.parse(JSON.stringify(this.currentRec[realProp]));
                    } else {
                        this.origfields[key][realProp] = null;   // TODO: problematic; need to clean-up nulls
                    }
                }
            }
        }
        
        if(!id){
            if(subsetname){
                if(md && md[fieldName]){
                    //Remove temp keys
                    if(md[fieldName] instanceof Array) {
                        md[fieldName].forEach(item =>{
                            delete item["isNew"];
                            delete item["dataChanged"];
                        });
                    }else{
                        delete md[fieldName]["isNew"];
                        delete md[fieldName]["dataChanged"];
                    }
                    // body = JSON.stringify(md[fieldName]);
                    if(Array.isArray(md[fieldName]))
                        body = md[fieldName];
                    else
                        body = JSON.stringify(md[fieldName]);
                }else
                    body = "";
            }else{
                if(md)
                    body = JSON.stringify(md);
                else
                    body = "";
            }
        }else{
            if(md)
                body = JSON.stringify(md);
            else
                body = "";
        }

        // If no body, remove this field from curent record
        if(!body) {
            delete this.currentRec[fieldName];
            body = JSON.stringify(this.currentRec);
            updateWholeRecord = true;
        }

        return new Promise<boolean>((resolve, reject) => {
            // this.custsvc.updateMetadata(md, subsetname, id, subsetnameAPI).subscribe({
            this.custsvc.updateMetadata(body, updateWholeRecord?undefined:fieldName, id, subsetnameAPI).subscribe({
                next: (res) => {
                    console.log("###DBG  Draft data returned from server:\n  ", res);
                    
                    this.stampUpdateDate();
                    this.updateInMemoryRec(res, fieldName, id, updateWholeRecord);
                    // this.mdres.next(this.currentRec);
                    resolve(true);
                },
                error: (err) => {
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') {
                        console.error("Failed to save metadata changes: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else {
                        console.error("Failed to save metadata changes: server/system error:" + err.message);
                        this.msgsvc.syserror(err.message,
                            "There was an problem while updating the " + subsetname + ". ");
                    }
                    resolve(false);
                }
            });
        });
        // }
    }

    /**
     * Update saved record for undo purpose
     * @param res Dataset object, could be Nerdm record or a subset or a particular record of a subset
     * @param subsetname - optional - subset name
     * @param id - optional - id of a subset item 
     */
    public updateInMemoryRec(res: any, subsetname: string = undefined, id: string = undefined, updateWholeRecord: boolean = false) {
        if(updateWholeRecord){
            this.currentRec = res as NerdmRes;
        }else if(!subsetname) { // Update the whole record
            this.currentRec = JSON.parse(JSON.stringify(res));
        }else if(!id) {
            if(res && JSON.stringify(res) != "[]") {
                //Hard coded topic here, need to discuss better solution
                if(subsetname == 'theme' || subsetname == 'topics'){
                    this.currentRec[subsetname] = JSON.parse(JSON.stringify(res));
                }else{
                    this.currentRec[subsetname] = JSON.parse(JSON.stringify(res));
                }
            }else{
                delete this.currentRec[subsetname];
            }
        }else{
            let index = this.currentRec[subsetname].findIndex(x => x["@id"] == id);
            if(index >= 0) {
                this.currentRec[subsetname][index] = JSON.parse(JSON.stringify(res));
            }else{
                let newItem = JSON.parse(JSON.stringify(res));
                newItem["@id"] = id;
                this.currentRec[subsetname].push(newItem);
            }
        }

        this.mdres.next(JSON.parse(JSON.stringify(this.currentRec)) as NerdmRes);
    }
    
    public add(md: any, subsetname: string = undefined, subsetnameAPI: string = undefined):Observable<Object> {
        return new Observable<Object>(subscriber => {
            this.custsvc.add(md, subsetname, subsetnameAPI).subscribe({
                next: (res) => {
                    let obj = res as Object[];
                    this.currentRec[subsetname] = JSON.parse(JSON.stringify(res));

                    obj.forEach(sub => {
                        let key = subsetname + sub['@id'];
                        this.origfields[key] = {};
                        this.origfields[key][subsetname] = JSON.parse(JSON.stringify(this.currentRec[subsetname]));
                    })
                    // let key = subsetname + obj['@id'];
                    // this.origfields[key] = {};
                    // this.origfields[key][subsetname] = JSON.parse(JSON.stringify(this.currentRec[subsetname]));

                    this.mdres.next(JSON.parse(JSON.stringify(this.currentRec)) as NerdmRes);
                    // resolve(true);
                    subscriber.next(JSON.parse(JSON.stringify(this.currentRec[subsetname])));
                    subscriber.complete();
                },
                error: (err) => {
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') {
                        console.error("Failed to update metadata changes: user error:" + err.message);
                        this.msgsvc.error(err.message)
                    }
                    else {
                        console.error("Failed to update metadata changes: server/system error:" +
                            err.message);
                        this.msgsvc.syserror(err.message,
                            "There was an problem while updating changes to the " + subsetname + ". ")
                    }
                    // resolve(false);
                    subscriber.next(null);
                    subscriber.complete();
                }
            });
        });
    }

    /**
     * undo a previously submitted update by its name (load from original)
     * 
     * @param subsetname    the name for the metadata that was used in the call to update() which 
     *                      should be undone.
     * @param id   Component id. If provided, only update specific @id.
     * @param subsetnameAPI the API that appends to default URL to make update call.
     * @param originalValue If provided, use it instead of the original value in the service. This parameter will be ignored if id is provided.
     * @return Promise<boolean>  -  result is true if the undo was successful, false if 
     *             there was an issue, including that there was nothing to undo.  Note that this 
     *             MetadataUpdateService instance will take care of reporting the reason.  This 
     *             response allows the caller in charge of getting updates to have its UI react
     *             accordingly.
     */
    public undo(subsetname: string, id: string = undefined, subsetnameAPI: string = undefined, originalValue: any = null) {
        let updateWholeRecord: boolean = false;
        let key = id? subsetname + id : subsetname;
        let fieldName = subsetname.split("-")[0];

        if (!subsetname || !this.origfields) {
            // Nothing to undo!
            console.warn("Undo called on " + subsetname + ": nothing to undo");
            return new Promise<boolean>((resolve, reject) => {
                resolve(false);
            });
        }

        // if there are no other updates registered, we will just request that the the draft be
        // deleted on the server.  So is this the only update we have registered?

        let finalUndo: boolean = true;
        if(!id){
            Object.keys(this.origfields).forEach((fKey) => {
                finalUndo = finalUndo && (fKey.indexOf(subsetname) >= 0);
            })
        }else{
            finalUndo = Object.keys(this.origfields).length == 1 &&
            this.origfields[key] !== undefined;
        }

        if (finalUndo) {
            // Last set to be undone; just delete the draft on the server
            console.log("Last undo; discarding draft on server.");
            this.origfields = {};
            this.forgetUpdateDate();
        }

        // Other updates are still registered; just undo the specified one
        return new Promise<boolean>((resolve, reject) => {
            let postMsg: any;

            // undo specific id
            if(id){
                if(this.originalDraftRec[fieldName]) {
                    let index = this.originalDraftRec[fieldName].findIndex(x => x["@id"] == id);
                    if(index >= 0) {
                        postMsg = this.originalDraftRec[fieldName][index];
                    }else {
                        postMsg = undefined;
                        // resolve(false);
                    }
                }else{
                    postMsg = undefined;
                }

                // Locate the current rec because the index may not be the same as in original record
                if(this.currentRec[fieldName]){
                    let currentElementIndex = this.currentRec[fieldName].findIndex(x => x["@id"] == id);

                    if(this.originalDraftRec[fieldName]){
                        this.currentRec[fieldName][currentElementIndex] = JSON.parse(JSON.stringify(this.originalDraftRec[fieldName].find(x => x["@id"] == id)));

                        postMsg = this.currentRec[fieldName][currentElementIndex];
                    }else{ //Original record does not have reference, current ref was newly added
                        postMsg = undefined;
                    }                    
                }else{
                    postMsg = undefined;
                }
                // delete specific origfield
                delete this.origfields[key];

            }else {    // undo the whole subset
                if(originalValue) {
                    postMsg = originalValue;
                }else {
                    postMsg = this.originalDraftRec[fieldName];
                }

                if(postMsg){
                    this.currentRec[fieldName] = JSON.parse(JSON.stringify(postMsg));
                }else{
                    delete this.currentRec[fieldName];
                    postMsg = this.currentRec;

                    updateWholeRecord = true;
                }

                //Delete all origfields related to the subset
                Object.keys(this.origfields).forEach((fKey) => {
                    if(fKey.includes(subsetname)) {
                        delete this.origfields[fKey];
                    }
                })
            }

            if(postMsg){
                let body: any;
                if(Array.isArray(postMsg) || typeof postMsg === 'string')
                    body = postMsg
                else
                    body = JSON.stringify(postMsg);

                this.custsvc.updateMetadata(body, updateWholeRecord?undefined:fieldName, id, subsetnameAPI).subscribe({
                    next: (res) => {
                        this.updateInMemoryRec(res, fieldName, id, updateWholeRecord);
                        this.mdres.next(JSON.parse(JSON.stringify(this.currentRec)) as NerdmRes);
                        // this.mdres.next(res as NerdmRes);
                        resolve(true);
                    },
                    error: (err) => {
                        // err will be a subtype of CustomizationError
                        if (err.type == 'user') {
                            console.error("Failed to undo metadata changes: user error:" + err.message);
                            this.msgsvc.error(err.message)
                        }
                        else {
                            console.error("Failed to undo metadata changes: server/system error:" +
                                err.message);
                            this.msgsvc.syserror(err.message,
                                "There was an problem while undoing changes to the " + subsetname + ". ")
                        }
                        resolve(false);
                    }
                });
            }else{
                resolve(true);
            }
        });
        // }
    }

    /**
     * Compare the subset of the given Nerdm record with original copy. If any subset is different, meaning the data has been changed, the original copy of the subset will be assigned to origfields object. The origfields object is used to set the field state in UI, i.e., the modified field will be in yellow background color.
     * This function also checks the update details of the given record which will be displayed in the status bar at the top.
     * @param mdrec The Nerdm record to be checked.
     */
    public checkUpdatedFields(mdrec: NerdmRes) {
        if (mdrec != undefined && this.currentRec != undefined) {
            for (let subset in mdrec) {
                if (this.currentRec[subset] != undefined && JSON.stringify(mdrec[subset]) != JSON.stringify(this.currentRec[subset])) {
                    this.origfields[subset] = {};
                    this.origfields[subset][subset] = JSON.parse(JSON.stringify(this.currentRec[subset]));
                }
            }
        }

        //Set updated date here so the submit button will lit up if we have something to submit
        let newdate: any;

        if (mdrec && mdrec._updateDetails != undefined && mdrec._updateDetails.length > 0) {
            newdate = new Date(mdrec._updateDetails[mdrec._updateDetails.length - 1]._updateDate);

            this.lastUpdate = {
                'userAttributes': this.authsvc.userAttributes,
                '_updateDate': newdate.toLocaleString()
            }
        } else {
            this.lastUpdate = null;
        }
    }

    /**
     * return true if metadata associated with a given name have been updated.  This will return 
     * false either if the metadata was never updated or if the update was previously undone via 
     * undo().
     * @param subsetname    the name for the set of metadata of interest.
     */
    public fieldUpdated(subsetname: string, id: string = undefined): boolean {
        let key = id? subsetname + id : subsetname;
        return this.origfields[key] != undefined;
    }

    /**
     * return true if metadata associated with a given name + any id have been updated.  This will return 
     * false either if the metadata was never updated or if the update was previously undone via 
     * undo().
     * @param subsetname    the name for the set of metadata of interest.
     */
    public anyFieldUpdated(subsetname: string): boolean {
        let updated = this.origfields[subsetname];

        Object.keys(this.origfields).forEach((fKey) => {
            updated = updated || (fKey.indexOf(subsetname) >= 0);
        })

        return updated;
    }

    /**
     * Reset the update status of a given field or all fields so fieldUpdated() will return false
     * @param subsetname - optional - the name for the set of metadata of interest.
     */
    public fieldReset(subsetname?: string) {
        if (subsetname) {
            this.origfields[subsetname] = null;
        } else {
            this.origfields = {};
        }
    }

    /**
     * Retrive a subset or a particular item of a subset from memory
     * @param subsetname the name for the set of metadata of interest.
     * @param id - optional - the id of the particular subset item of interest.
     * @param onSuccess - optional - callback function
     * @returns subset or particular item of the subset
     */
    public loadSavedSubsetFromMemory(subsetname: string, id: string = undefined, onSuccess?: () => void): Observable<Object> {
        return new Observable<Object>(subscriber => {
            let res: any = null;
            if(subsetname) {
                if(this.currentRec[subsetname] == undefined)
                    res = undefined;
                else{
                    if(id) {
                        res = JSON.parse(JSON.stringify(this.currentRec[subsetname].find(x => x["@id"]==id)));
                    }else {
                        res = JSON.parse(JSON.stringify(this.currentRec[subsetname]));
                    }
                }
            }

            subscriber.next(res);
            subscriber.complete();
            if (onSuccess) onSuccess(); 
        });
    }

    /**
     * Retrive a subset or a particular item of a subset from server
     * @param subsetname the name for the set of metadata of interest.
     * @param id - optional - the id of the particular subset item of interest.
     * @param onSuccess - optional - callback function
     * @returns subset or particular item of the subset
     */
    public loadSavedSubsetFromServer(subsetname: string, id: string = undefined, onSuccess?: () => void): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to update without authorization!  Ignoring update.");
                return;
            }
            this.custsvc.getSubset(subsetname, id).subscribe({
                next:(res) => {
                    subscriber.next(res);
                    subscriber.complete();
                    if (onSuccess) onSuccess(); 
                },
                error:(err) => {
                    console.error("err", err);
                    
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to retrieve draft metadata changes: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to retrieve draft metadata changes: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }

                    subscriber.next(null);
                    subscriber.complete();
                }
            })
        });
    }

    /**
     * load the latest draft of the resource metadata.
     * 
     * retrieve the latest draft of the resource metadata from the server and forward it
     * to the controller for display to the user.  
     */
    public loadDraft(dataOnly: boolean = false, onSuccess?: () => void): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to update without authorization!  Ignoring update.");
                return;
            }
            this.custsvc.getDraftMetadata(dataOnly).subscribe({
                next: (res) => {
                    if(res) {
                        if(!dataOnly){
                            this.originalDraftRec = JSON.parse(JSON.stringify(res));
                            this.currentRec = JSON.parse(JSON.stringify(res));
                        }else{
                            console.log("Load data only...")
                            if(res["components"]) {
                                this.originalDraftRec["components"] = JSON.parse(JSON.stringify(res["components"]));
                                this.currentRec["components"] = JSON.parse(JSON.stringify(res["components"]));
                            }
                        }
                    }else {
                        this.originalDraftRec = {} as NerdmRes;
                        this.currentRec = {} as NerdmRes;
                    }

                    this.mdres.next(this.currentRec as NerdmRes);
                    subscriber.next(this.currentRec as NerdmRes);
                    subscriber.complete();
                    if (onSuccess) onSuccess();
                },
                error: (err) => {
                  console.error("err", err);
                  this.edstatsvc.setShowLPContent(true);
                  
                  if(err.statusCode == 404)
                  {
                    this.resetOriginal();
                    this.edstatsvc._setEditMode(this.EDIT_MODES.OUTSIDE_MIDAS_MODE);
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to retrieve draft metadata changes: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to retrieve draft metadata changes: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }

    /**
     * Load DBIO object from server
     * @param onSuccess 
     * @returns DBIO object
     */
    public loadDBIOrecord(onSuccess?: () => void): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to fetch without authorization!  Ignoring...");
                return;
            }

            this.custsvc.getDBIOrecord().subscribe({
                next: (res) => {
                    this._dbioRecord = res as DBIOrecord;
                    if(this._dbioRecord && this._dbioRecord.file_space && this._dbioRecord.file_space.location){
                        this.setFileManagerUrl(this._dbioRecord.file_space.location)
                    }

                    subscriber.next(res as DBIOrecord);
                    subscriber.complete();
                    if (onSuccess) onSuccess();
                },
                error: (err) => {
                  console.error("err", err);
                  this.edstatsvc.setShowLPContent(true);
                  
                  if(err.statusCode == 404)
                  {
                    this.msgsvc.error(err.message);
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to retrieve DBIO record: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to retrieve DBIO record: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }

    /**
     * record the current date/time as the last time this data was updated.
     */
    public stampUpdateDate(): UpdateDetails {
        this.lastUpdate = {
            'userAttributes': this.authsvc.userAttributes,
            '_updateDate': this.datePipe.transform(new Date(), "MMM d, y, h:mm:ss a")
        }
        return this.lastUpdate;
    }

    /**
     * erase the date of last update.  This might be done if the last update was undone. 
     */
    public forgetUpdateDate(): void {
        this.lastUpdate = null;
    }

    /**
     * update the local (browser-side) metadata with the the original metadata from the last
     * time the metadata was committed.  This will not update the draft that exists in the 
     * customization service.  
     */
    public showOriginalMetadata() {
        this.mdres.next(JSON.parse(JSON.stringify(this.currentRec)));
    }

    /**
     * Tell whether we are in edit mode
     */
    get isEditMode(): boolean{
      return this.editMode == this.EDIT_MODES.EDIT_MODE;
    }

    /**
     *  Return field style based on edit mode and data update status
     * If no edit mode was provided, this.isEditMode will be used
     */
    getFieldStyle(fieldName : string, dataChanged: boolean = false, id: string = undefined, editmode: boolean = undefined) {
        let editMode: boolean;
        editMode = editmode == undefined? this.isEditMode : editmode;

        if (editMode) {
            if(!id){
                if(dataChanged) {
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--data-changed)', 'padding-right': '1em', 'cursor': 'pointer' };
                } else if(this.anyFieldUpdated(fieldName)){
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--data-changed-saved)', 'padding-right': '1em', 'cursor': 'pointer' };
                }else{
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--editable)', 'padding-right': '1em', 'cursor': 'pointer' };
                }
            }else{
                if(dataChanged){
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--data-changed)', 'padding-right': '1em', 'cursor': 'pointer' };
                }else if(this.fieldUpdated(fieldName, id)){
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--data-changed-saved)', 'padding-right': '1em', 'cursor': 'pointer' };
                }else{
                    return { 'border': '1px solid lightgrey', 'background-color': 'var(--editable)', 'padding-right': '1em', 'cursor': 'pointer' };
                }                
            }
        } else {
            return { 'border': '0px solid white', 'background-color': 'white', 'padding-right': '1em', 'cursor': 'default' };
        }
    }

    /**
     * load files from the file manager.
     */
     public loadDataFiles(onSuccess?: () => void): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to update without authorization!  Ignoring update.");
                return;
            }
            this.custsvc.getDataFiles().subscribe({
                next: (res) => {
                  subscriber.next(res as NerdmComp[]);
                  subscriber.complete();
                  if (onSuccess) onSuccess();
                },
                error: (err) => {
                  console.error("err", err);
                  
                  if(err.statusCode == 404)
                  {
                    // handle 404
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to retrieve data files: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to retrieve data files: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }   
    
    /**
     * load metadata from the server.
     */
    public loadMetaData(): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to update without authorization!  Ignoring update.");
                return;
            }
            this.custsvc.getMidasMeta().subscribe({
                next: (res) => {
                    subscriber.next(res);
                    subscriber.complete();
                },
                error: (err) => {
                  console.error("err", err);
                  
                  if(err.statusCode == 404)
                  {
                    // handle 404
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to retrieve metadata: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to retrieve metadata: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }      

    /**
     * Validate the status from backend
     */
    public validate(): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to validate without authorization!  Ignoring validate.");
                return;
            }
            this.custsvc.validate().subscribe({
                next: (res) => {
                    subscriber.next(res);
                    subscriber.complete();
                },
                error: (err) => {
                  console.error("err", err);
                  
                  if(err.statusCode == 404)
                  {
                    // handle 404
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to validate: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to validate: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }      

    public getEnvelop(): Observable<Object> {
        return new Observable<Object>(subscriber => {
            if (!this.custsvc) {
                console.error("Attempted to validate without authorization!  Ignoring validate.");
                return;
            }
            this.custsvc.getEnvelop().subscribe({
                next: (res) => {
                    subscriber.next(res);
                    subscriber.complete();
                },
                error: (err) => {
                  console.error("err", err);
                  
                  if(err.statusCode == 404)
                  {
                    // handle 404
                  }else{
                    // err will be a subtype of CustomizationError
                    if (err.type == 'user') 
                    {
                        console.error("Failed to validate: user error:" + err.message);
                        this.msgsvc.error(err.message);
                    }
                    else 
                    {
                        console.error("Failed to validate: server error:" + err.message);
                        this.msgsvc.syserror(err.message);
                    }
                  }

                  subscriber.next(null);
                  subscriber.complete();
                }
            });
        });
    }      
}
