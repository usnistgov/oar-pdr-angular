import { Injectable } from '@angular/core';
import { NerdmRes, NerdmComp, NERDResource } from '../nerdm/nerdm';
import * as globals from '../shared/globals/globals'

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

    constructor() { }

    getSuggestions(record: NerdmRes, resourceType: string) {
        let required: string[] = [];
        let recommended: string[] = [];
        let niceToHave: string[] = [];
        
        // Required fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.TITLE)]) 
            required.push(globals.Sections.TITLE);

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.DESCRIPTION)] || record[globals.SectionPrefs.getFieldName(globals.Sections.DESCRIPTION)].length == 0) 
            required.push(globals.Sections.DESCRIPTION);

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.TOPICS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.TOPICS)].length == 0) 
            required.push(globals.Sections.TOPICS);

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.KEYWORDS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.KEYWORDS)].length == 0) 
            required.push(globals.Sections.KEYWORDS);

        // Recommended fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.AUTHORS)] || record[globals.SectionPrefs.getFieldName(globals.Sections.AUTHORS)].length == 0) 
            recommended.push(globals.Sections.AUTHORS);

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.CONTACT)]) 
            recommended.push(globals.Sections.CONTACT);

        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.VISIT_HOME_PAGE)]) 
            recommended.push(globals.Sections.VISIT_HOME_PAGE);

        let accessPages: NerdmComp[] = (new NERDResource(record)).selectAccessPages();

        // If resource type is "software", access page links are recommended. Otherwise they are nice to have.
        if(!accessPages || accessPages.length == 0) {
            if(resourceType == globals.ResourceType.SOFTWARE) {
                recommended.push(globals.Sections.ACCESS_PAGES);
            }else{
                niceToHave.push(globals.Sections.ACCESS_PAGES);
            }
        }

        // Nice to have fields
        if(!record[globals.SectionPrefs.getFieldName(globals.Sections.REFERENCES)] || record[globals.SectionPrefs.getFieldName(globals.Sections.REFERENCES)].length == 0) 
            niceToHave.push(globals.Sections.REFERENCES);

        let suggestions: any = {};
        if(required && required.length >0) suggestions["required"] = required;
        if(recommended && recommended.length >0) suggestions["recommended"] = recommended;
        if(niceToHave && niceToHave.length >0) suggestions["niceToHave"] = niceToHave;

        return suggestions;
        // return {
        //     "required": required,
        //     "recommended": [globals.Sections.AUTHORS, globals.Sections.ACCESS_PAGES],
        //     "niceToHave": [globals.Sections.REFERENCES]
        // } 
    }
}
