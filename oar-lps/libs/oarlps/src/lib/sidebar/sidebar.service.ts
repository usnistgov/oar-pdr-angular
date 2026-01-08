import { Injectable } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../nerdm/nerdm';
import * as globals from '../shared/globals/globals'
import { BehaviorSubject } from 'rxjs';
import { SectionHelp } from '../shared/globals/globals';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

    constructor() { }

    // Indicate which section help content to display
    _sectionHelp: BehaviorSubject<SectionHelp> = new BehaviorSubject<SectionHelp>({} as SectionHelp);
    setSectionHelp(sectionHelp: SectionHelp){
        this._sectionHelp.next(sectionHelp);
    }
    public watchSectionHelp(subscriber) {
        this._sectionHelp.subscribe(subscriber);
    }

    //This is for testing purpose. The real suggestions will be provided by DBIO backend.
    //This function is called by the fake backend provider.
    getSuggestions(record: NerdmRes, resourceType: string) {
        let required: any[] = [];
        let warn: any[] = [];
        let recommend: any[] = [];
        
        // Required fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.TITLE)]) 
            required.push({
                "id": "testId",
                "subject": globals.Sections.TITLE,
                "summary": "Add " + globals.Sections.TITLE,
                "details": [globals.Sections.TITLE + " is required."]
            });

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.DESCRIPTION)] || record[globals.SectionPrefs.getFieldName(globals.Sections.DESCRIPTION)].length == 0) 
            required.push({
                "id": "testId",
                "subject": globals.Sections.DESCRIPTION,
                "summary": "Add " + globals.Sections.DESCRIPTION,
                "details": [globals.Sections.DESCRIPTION + " is required."]
            });

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.TOPICS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.TOPICS)].length == 0) 
            required.push({
                "id": "testId",
                "subject": globals.Sections.TOPICS,
                "summary": "Add " + globals.Sections.TOPICS,
                "details": [globals.Sections.TOPICS + " is required."]
            });

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.KEYWORDS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.KEYWORDS)].length == 0) 
            required.push({
                "id": "testId",
                "subject": globals.Sections.KEYWORDS,
                "summary": "Add " + globals.Sections.KEYWORDS,
                "details": [globals.Sections.KEYWORDS + " is required."]
            });

        // warn fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.AUTHORS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.AUTHORS)].length == 0) 
            warn.push({
                "id": "testId",
                "subject": globals.Sections.AUTHORS,
                "summary": "Add " + globals.Sections.AUTHORS,
                "details": [globals.Sections.AUTHORS + " is highly recommended."]
            });

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.CONTACT)]) 
            warn.push({
                "id": "testId",
                "subject": globals.Sections.CONTACT,
                "summary": "Add " + globals.Sections.CONTACT,
                "details": [globals.Sections.CONTACT + " is highly recommended."]
            });

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.VISIT_HOME_PAGE)]) 
            warn.push({
                "id": "testId",
                "subject": globals.Sections.VISIT_HOME_PAGE,
                "summary": "Add " + globals.Sections.VISIT_HOME_PAGE,
                "details": [globals.Sections.VISIT_HOME_PAGE + " is highly recommended."]
            });

        let accessPages: NerdmComp[] = (new NERDResource(record)).selectAccessPages();

        // If resource type is "software", access page links are highly recommended. Otherwise they are recommended.
        if(!accessPages || accessPages.length == 0) {
            if(resourceType == globals.ResourceType.SOFTWARE) {
                warn.push({
                    "id": "testId",
                    "subject": globals.Sections.ACCESS_PAGES,
                    "summary": "Add " + globals.Sections.ACCESS_PAGES,
                    "details": [globals.Sections.ACCESS_PAGES + " is highly recommended for resource type software."]
                });
            }else{
                recommend.push({
                    "id": "testId",
                    "subject": globals.Sections.ACCESS_PAGES,
                    "summary": "Add " + globals.Sections.ACCESS_PAGES,
                    "details": [globals.Sections.ACCESS_PAGES + " is recommended."]
                });
            }
        }

        // Recommend fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.REFERENCES)] || record[globals.SectionPrefs.getFieldName(globals.Sections.REFERENCES)].length == 0) 
            recommend.push({
                "id": "testId",
                "subject": globals.Sections.REFERENCES,
                "summary": "Add " + globals.Sections.REFERENCES,
                "details": [globals.Sections.REFERENCES + " is recommended."]
            });

        let suggestions: any = {};
        if(required && required.length >0) suggestions["req"] = required;
        if(warn && warn.length >0) suggestions["warn"] = warn;
        if(recommend && recommend.length >0) suggestions["rec"] = recommend;

        return suggestions;
    }
}
