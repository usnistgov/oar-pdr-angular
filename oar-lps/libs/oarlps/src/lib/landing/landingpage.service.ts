import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SectionMode, SectionHelp, MODE, SubmitResponse } from '../shared/globals/globals';
import { NerdmRes } from '../nerdm/nerdm';
import { strict } from 'assert';

let _helpTopic = {};
_helpTopic[MODE.NORNAL]  = 'general';
_helpTopic[MODE.LIST]  = 'list';
_helpTopic[MODE.EDIT]  = 'edit';
_helpTopic[MODE.ADD]  = 'add';
_helpTopic["dragdrop"]  = 'dragdrop';
_helpTopic["seealso"]  = 'seealso';

export const HelpTopic = _helpTopic;

@Injectable({
  providedIn: 'root'
})
export class LandingpageService {
    sectionMode = signal<SectionMode>({} as SectionMode);

    constructor() { }

    //This variable tells the system which section user is interested (so it can scroll to the section).
    _currentSection: BehaviorSubject<string> = new BehaviorSubject<string>("top");
    setCurrentSection(val: string){
        this._currentSection.next(val);
    }
    public watchCurrentSection(subscriber) {
        this._currentSection.subscribe(subscriber);
    }

    // Broadcasting which section is in edit mode. Other section should push unsaved data to draft server and enter non-edit mode
    _editing: BehaviorSubject<SectionMode> = new BehaviorSubject<SectionMode>({} as SectionMode);
    setEditing(section: SectionMode){
        this.sectionMode.set(section);
        this._editing.next(section);
    }
    public watchEditing(subscriber) {
        this._editing.subscribe(subscriber);
    }

    // Indicate which section help content to display
    _sectionHelp: BehaviorSubject<SectionHelp> = new BehaviorSubject<SectionHelp>({} as SectionHelp);
    setSectionHelp(sectionHelp: SectionHelp){
        this._sectionHelp.next(sectionHelp);
    }
    public watchSectionHelp(subscriber) {
        this._sectionHelp.subscribe(subscriber);
    }

    // Set and watch help text returned from submit function
    _submitResponse: BehaviorSubject<SubmitResponse> = new BehaviorSubject<SubmitResponse>({} as SubmitResponse);
    setSubmitResponse(submitResponse: SubmitResponse){
        this._submitResponse.next(submitResponse);
    }

    public watchSubmitResponse(subscriber) {
        this._submitResponse.subscribe(subscriber);
    }
        
    // Indicate which resource type to display
    _resourceType: BehaviorSubject<string> = new BehaviorSubject<string>("resource");
    setResourceType(resourceType: string){
        this._resourceType.next(resourceType);
    }
    public watchResourceType(subscriber) {
        this._resourceType.subscribe(subscriber);
    }    

    // Indicate which resource type to display
    _mobileMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    setMobileMode(mobileMode: boolean){
        this._mobileMode.next(mobileMode);
    }
    public watchMobileMode(subscriber) {
        this._mobileMode.subscribe(subscriber);
    }  

    // Set message to display
    _msg: BehaviorSubject<string> = new BehaviorSubject<string>("resource");
    setMessage(msg: string){
        this._msg.next(msg);
    }
    public watchMessage(subscriber) {
        this._msg.subscribe(subscriber);
    }      

    /**
     * Check if all required fields are filled
     * @param mdrec input Nerdm record
     */
    readySummit(mdrec: NerdmRes) {
        // if(!mdrec) return false;
        // else if(!mdrec.title || !mdrec.contactPoint || !mdrec.contactPoint.fn || !mdrec.description || mdrec.description.length == 0 || !mdrec.theme || mdrec.theme.length == 0 || !mdrec.keyword || mdrec.keyword.length == 0) return false
        // else return true;

        if(!mdrec) return false;
        else if(!mdrec.title || !mdrec.contactPoint || !mdrec.contactPoint.fn || !mdrec.description || mdrec.description.length == 0 || !mdrec.keyword || mdrec.keyword.length == 0) return false
        else return true;
    }
}
