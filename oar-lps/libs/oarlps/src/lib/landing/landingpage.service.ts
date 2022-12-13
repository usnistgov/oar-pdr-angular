import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * a representation of a section mode
 */
export interface SectionMode {
    "section": string,
    "mode": string
}

export const MODE = {
    "NORNAL": "normal",
    "EDIT": "edit",
    "ADD": "add"
}

@Injectable({
  providedIn: 'root'
})
export class LandingpageService {

    constructor() { }

    //This variable tells the system which section user ia interested (so it can scroll to the section).
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
}
