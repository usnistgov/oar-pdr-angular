import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SectionMode, SectionHelp, MODE } from '../shared/globals/globals';

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

    // Indicate which section help content to display
    _resourceType: BehaviorSubject<string> = new BehaviorSubject<string>("resource");
    setResourceType(resourceType: string){
        this._resourceType.next(resourceType);
    }
    public watchResourceType(subscriber) {
        this._resourceType.subscribe(subscriber);
    }    

    // Set message to display
    _msg: BehaviorSubject<string> = new BehaviorSubject<string>("resource");
    setMessage(msg: string){
        this._msg.next(msg);
    }
    public watchMessage(subscriber) {
        this._msg.subscribe(subscriber);
    }      
}
