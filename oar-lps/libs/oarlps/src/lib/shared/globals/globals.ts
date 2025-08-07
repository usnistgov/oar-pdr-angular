import { Inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectItem, TreeNode } from 'primeng/api';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
    public message = signal("");
    public sectionMode = signal<SectionMode>({} as SectionMode);
    public collection = signal<string>("");
    public sectionHelp = signal<SectionHelp>({} as SectionHelp);
    public fakeBackendAlerted = signal<boolean>(false);

    constructor(@Inject(DOCUMENT) private document: Document,) { }

    /**
     * Current collection.  
     * Make collection observable for any component.
     */
    _collection : BehaviorSubject<string> =
        new BehaviorSubject<string>("");
    public setCollection(val : string) { 
        this._collection.next(val); 
    }
    public watchCollection(subscriber) {
        this._collection.subscribe(subscriber);
    }    

    /**
     * Set/get the width of the left side landing page 
     */
    _lpsLeftWidth : BehaviorSubject<number> =
        new BehaviorSubject<number>(600);
    public setLpsLeftWidth(val : number) { 
        this._lpsLeftWidth.next(val); 
    }
    public watchLpsLeftWidth(subscriber) {
        this._lpsLeftWidth.subscribe(subscriber);
    }  

    /**
     * Set/get message to display 
     */
    _message : BehaviorSubject<string> =
        new BehaviorSubject<string>("");
    public setMessage(val : string) { 
        this._message.next(val); 
    }
    public watchMessage(subscriber) {
        this._message.subscribe(subscriber);
    }  

    /**
     * Set/get user's authorization info 
     */
    _authorized : BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    public setAuthorized(val : boolean) { 
        this._authorized.next(val); 
    }
    public watchAuthorized(subscriber) {
        this._authorized.subscribe(subscriber);
    }  

    /**
     * Set/get user's authentication info 
     */
    _authenticated : BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    public setAuthenticated(val : boolean) { 
        this._authenticated.next(val); 
    }
    public watchAuthenticated(subscriber) {
        this._authenticated.subscribe(subscriber);
    } 

    /**
     * Set/get current record 
     */
    _currentRec : BehaviorSubject<any> =
        new BehaviorSubject<any>({});
    public setCurrentRec(val : any) { 
        this._currentRec.next(val); 
    }
    public watchCurrentRec(subscriber) {
        this._currentRec.subscribe(subscriber);
    } 

    /**
     * Flag to tell the app to hide the content display or not. 
     * Usecase: to hide server side rendering content while in edit mode and display the content when 
     * browser side rendering is ready.
     */
    _showLPContent: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public setShowLPContent(val: boolean){
        this._showLPContent.next(val);
    }
    public watchShowLPContent(subscriber) {
        this._showLPContent.subscribe(subscriber);
    }

    getTextWidth(textString: string, font: string="Roboto,'Helvetica Neue',sans-serif", size:number=22, fontWeight: string="bold") {
        let text = this.document.createElement("span"); 
        this.document.body.appendChild(text); 
     
        text.style.fontFamily = font; 
        text.style.fontSize = size + "px"; 
        text.style.fontWeight = fontWeight; 
        text.style.height = 'auto'; 
        text.style.width = 'auto'; 
        text.style.position = 'absolute'; 
        text.style.whiteSpace = 'no-wrap'; 
        text.innerHTML = textString; 
     
        let width = Math.ceil(text.clientWidth); 
        this.document.body.removeChild(text); 

        return width * 0.9 + 50;
    }
}

export const NIST = "National Institute of Standards and Technology";

export const GENERAL = "general";

export class Themes {
    static readonly SCIENCE_THEME = 'ScienceTheme';
    static readonly DEFAULT_THEME = 'DefaultTheme';
}

let _theme = {};
_theme[Themes.SCIENCE_THEME] = "ScienceTheme";
_theme[Themes.DEFAULT_THEME] = "DefaultTheme";

let _sourceLabel = {};
_sourceLabel[Themes.SCIENCE_THEME] = "Collection";
_sourceLabel[Themes.DEFAULT_THEME] = "Dataset";

export class ThemesPrefs {
    private static readonly _lTheme = _theme;
    private static readonly _lSourceLabel = _sourceLabel;

    public static getTheme(type: string) {
        if(! type || type == '') {
            return ThemesPrefs._lTheme[Themes.DEFAULT_THEME]
        }

        if(! ThemesPrefs._lTheme[type]) {
            return ThemesPrefs._lTheme[Themes.DEFAULT_THEME]
        }

        return ThemesPrefs._lTheme[type]
    }

    public static getResourceLabel(theme: string) {
        if(! theme || theme == '') {
            return ThemesPrefs._lSourceLabel[Themes.DEFAULT_THEME]
        }

        if(! ThemesPrefs._lSourceLabel[theme]) {
            return ThemesPrefs._lSourceLabel[Themes.DEFAULT_THEME]
        }

        return ThemesPrefs._lSourceLabel[theme]
    }
}

export class AppSettings {
    public static HOMEPAGE_DEFAULT_URL='https://nextcloud-dev.nist.gov';
    public static FILE_MANAGER_URL='https://nextcloud-dev.nist.gov/index.php/apps/files/?dir=/2618&fileid=4845';
}

/**
 * This is the infostruction a section or side bar will broadcast when edit mode changes. 
 * sender: the name of the section who sent the message (including side bar)
 * section: the name (Nerdm field name) of the section who sent the message. Most of time it's the same as sender. But when sender is side bar, the section will be the actual section name.
 * mode: the edit mode of this section. 
 */
export interface SectionMode {
    "sender": string, 
    "section": string,
    "mode": string
}

export interface SectionHelp {
    "section": string,
    "topic": string
}

export const MODE = {
    "NORMAL": "normal",
    "LIST": "list",
    "EDIT": "edit",
    "ADD": "add"
}

//For display purpose
export class Sections {
    static readonly DEFAULT_SECTION = 'Title';
    static readonly GENERAL = 'General';
    static readonly TITLE = 'Title';
    static readonly ACCESS_PAGES = 'Access Pages';
    static readonly DESCRIPTION = 'Description';
    static readonly TOPICS = 'Research Topics';
    static readonly KEYWORDS = 'Keywords';
    static readonly IDENTITY = 'Iidentity';
    static readonly ABOUT = 'About';
    static readonly REFERENCES = 'References';
    static readonly DATA_ACCESS = 'Data Access';
    static readonly AUTHORS = 'Authors';   
    static readonly FACILITATORS = 'Facilitators';  
    static readonly SIDEBAR = 'Sidebar'; 
    static readonly CONTACT = 'Contact';
    static readonly VISIT_HOME_PAGE = 'Visit Home Page';
    static readonly DOI = 'DOI';
    static readonly VERSION = 'Version';
    static readonly COLLECTION = 'Collection';
}

//_fieldName is the field name in Nerdm record
let _fieldName = {};
_fieldName[Sections.DEFAULT_SECTION] = "title";
_fieldName[Sections.TITLE] = "title";
_fieldName[Sections.ACCESS_PAGES] = "components";
_fieldName[Sections.DESCRIPTION] = "description";
// _fieldName[Sections.TOPICS] = "theme";
_fieldName[Sections.TOPICS] = "topic";
_fieldName[Sections.KEYWORDS] = "keyword";
_fieldName[Sections.IDENTITY] = "identity";
_fieldName[Sections.AUTHORS] = "identity";
// _fieldName[Sections.FACILITATORS] = "identity";
_fieldName[Sections.FACILITATORS] = "facilitators";
_fieldName[Sections.ABOUT] = "about";
_fieldName[Sections.REFERENCES] = "references";
_fieldName[Sections.AUTHORS] = "authors";
_fieldName[Sections.DATA_ACCESS] = "dataAccess";
_fieldName[Sections.SIDEBAR] = "sidebar";
_fieldName[Sections.CONTACT] = "contactPoint";
_fieldName[Sections.VISIT_HOME_PAGE] = "landingPage";
_fieldName[Sections.DOI] = "doi";
_fieldName[Sections.VERSION] = "version";

let _displayName = {};
_displayName[GENERAL] = Sections.GENERAL;
_displayName["title"] = Sections.TITLE;
_displayName["components"] = Sections.ACCESS_PAGES;
_displayName["description"] = Sections.DESCRIPTION;
_displayName["topic"] = Sections.TOPICS;
_displayName["keyword"] = Sections.KEYWORDS;
_displayName["identity"] = Sections.IDENTITY;
_displayName["about"] = Sections.ABOUT;
_displayName["references"] = Sections.REFERENCES;
_displayName["authors"] = Sections.AUTHORS;
_displayName["dataAccess"] = Sections.DATA_ACCESS;
_displayName["facilitators"] = Sections.FACILITATORS;
_displayName["sidebar"] = Sections.SIDEBAR;
_displayName["contactPoint"] = Sections.CONTACT;
_displayName["landingPage"] = Sections.VISIT_HOME_PAGE;
_displayName["doi"] = Sections.DOI;
_displayName["version"] = Sections.VERSION;

export class SectionPrefs {
    private static readonly _lSectionID = _fieldName;
    private static readonly _lDispName = _displayName;

    public static getFieldName(section: string) {
        if(! _fieldName || _fieldName == '') {
            return SectionPrefs._lSectionID[Sections.DEFAULT_SECTION]
        }

        if(! SectionPrefs._lSectionID[section]) {
            return SectionPrefs._lSectionID[Themes.DEFAULT_THEME]
        }

        return SectionPrefs._lSectionID[section]
    }

    public static getDispName(section: string) {
        if(! _displayName || _displayName == '' || ! SectionPrefs._lDispName[section]) {
            return SectionPrefs._lDispName[GENERAL];
        }

        return SectionPrefs._lDispName[section];
    }
}

export class ResourceType {
    static readonly RESOURCE = 'resource';
    static readonly SOFTWARE = 'software';
    static readonly DATA = 'data';
}

export interface Suggestion {
    "id": string,       //a unique identifier for the finding
    "subject": string,   //a name of a data property that the detected issue concerns; 
                        //this is the primary property that needs to be corrected
    "summary": string,    //a short (e.g. single sentence) description or title for the detected issue
    "details": string[] //a more detailed description of the issue.  Each element in the list can be
                            //considered a different paragraph.  The first element should summarize the
                            //problem, while subsequent elements can provide tips on how to correct the issue.
}

export interface ReviewResponse {
    "req": Suggestion[],
    "warn": Suggestion[],
    "rec": Suggestion[]
}

export interface SubmitResponse {
    "action": string,   //e.g. "validate"
    "message": string,  //this will be the message that was provided in the input or a default message if not provided
    "validation": {
        "failures": Suggestion[],
        "warnings": Suggestion[],
        "recommendations": Suggestion[],
    }
}

export class LandingConstants {
    public static get editModes(): any { 
        return {
            EDIT_MODE: 'editMode',
            PREVIEW_MODE: 'previewMode',
            DONE_MODE: 'doneMode',
            VIEWONLY_MODE: 'viewOnlyMode',
            OUTSIDE_MIDAS_MODE: 'outsideMidasMode'
        }
    };

    public static get editTypes(): any { 
        return {
            NORMAL: 'normal', 
            REVISE: 'revise' 
        }
    }; 

    public static get reviseTypes(): any { 
        return {
            METADATA: 'metadata', 
            TYPE02: 'reviseType02', 
            TYPE03: 'reviseType03'
        }
    };  
}

export interface ColorScheme {
    default: string;
    light: string;
    lighter: string;
    dark: string;
    hover: string;
}

export class Collections {
    static readonly DEFAULT = 'NIST';
    static readonly FORENSICS = 'Forensics';
    static readonly SEMICONDUCTORS = 'Semiconductors';
}

export class Collection {
    bannerUrl: string;
    taxonomyURI: string;
    color: ColorScheme;
    theme: CollectionThemes;
}

export interface ColorScheme {
    default: string;
    light: string;
    lighter: string;
    dark: string;
    hover: string;
}

export interface CollectionThemes {
    collectionThemes: SelectItem[];
    collectionThemesAllArray: string[];
    collectionUnspecifiedCount: number;
    collectionUniqueThemes: string[];
    collectionThemesWithCount: FilterTreeNode[];
    collectionThemesTree: FilterTreeNode[];
    collectionShowMoreLink: boolean;
    collectionSelectedThemesNode: any[];
}

/**
 * A TreeNode that knows how to insert and update items from a data cart
 */
export class FilterTreeNode implements TreeNode {
    children = [];
    count: number = 0;
    data: string[] = [];
    label: string = "";
    ediids: string[] = [];
    expanded = false;
    keyname: string = '';
    key: string = '';
    parent = null;
    level: number = 1;
    selectable: boolean = true;
    unspecified: boolean[] = [];
    
    constructor(label: string='', expanded: boolean = false, key: string=null, data: string = '', count: number = 0, selectable: boolean = true, level: number = 1) {
        this.label = label;
        if(data && !this.data.includes(data))
            this.data.push(data);
        this.count = count;
        this.selectable = selectable;
        this.level = level;
        this.keyname = key;
        this.key = key;
        if(!key) {
            this.keyname = label;
            this.key = label;
        }
    }

   /**
     * insert or update a node within this tree corresponding to the given data cart item
     * @return CartTreeNode   the node that was inserted or updated
     */
    upsertNodeFor(item: any[], level:number = 1, searchResults: any = null, collection: string = null, taxonomyURI: any = {}) : TreeNode {
        let levels = item[0].split(":");
        for(let i = 0; i < levels.length; i++) {
            levels[i] = levels[i].trim();
        }
        
        return this._upsertNodeFor(levels, item, level, searchResults, collection, taxonomyURI);
    }

    _upsertNodeFor(levels: string[], item: any[], level: number = 1, searchResults: any = null, collection: string=null, taxonomyURI: any = {}, parentKey:string = "") : TreeNode {
        let nodeLabel: string = ''; 
        // find the node corresponding to the given item in the data cart 
        for (let child of this.children) {
            if (child.keyname == levels[0]) {
                if(searchResults) {
                    for (let resultItem of searchResults) {
                        let found: boolean = false;
                        if(resultItem.topic && resultItem.topic.length > 0){
                            for(let topic of resultItem.topic) {
                                if(topic['scheme'].indexOf(taxonomyURI[collection]) >= 0) {
                                    if(collection == Collections.DEFAULT) {
                                        if(topic.tag.includes(item[0])) {
                                            found = true;
                                            break;
                                        }
                                    }else{
                                        if(topic.tag == item[0]) {
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
    
                        if(found){
                            if(!child.ediids.includes(resultItem.ediid)){
                                child.ediids.push(resultItem.ediid);
                                child.count++;
                            }
                        }        
                    }
                }

                if (levels.length > 1){
                    return child._upsertNodeFor(levels.slice(1), item, level+1, searchResults, collection, taxonomyURI);
                }else {
                    child.label = levels[0] + "---" + item[1];
                    if(!child.data.includes(item[0]))
                        child.data.push(item[0]);

                    return child;
                }
            }
        }

        // ancestor does not exist yet; create it
        let key = parentKey + levels[0];
        let label = levels[0];
        let data = item[0];

        let count = 0;
        if (levels.length == 1) {
            label += "---" + item[1]; 
        }

        if(levels[0] == "Unspecified") {
            count = item[1];
        }

        let child = new FilterTreeNode(label, false, key, data, count, true, level+1);
        child.parent = this;
        this.children = [...this.children, child];

        //Add only unique dataset to the count
        if(searchResults) {
            for (let resultItem of searchResults) {
                let found: boolean = false;
                if(resultItem.topic && resultItem.topic.length > 0){
                    for(let topic of resultItem.topic) {
                        if(topic['scheme'].indexOf(taxonomyURI[collection]) >= 0) {
                            if(collection == Collections.DEFAULT) {
                                if(topic.tag.includes(data)) {
                                    found = true;
                                    break;
                                }
                            }else{
                                if(topic.tag == data) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                if(found){
                    if(!child.ediids.includes(resultItem.ediid)){
                        child.ediids.push(resultItem.ediid);
                        child.count++;
                    }
                }        
            }
        }

        if (levels.length > 1){
            return child._upsertNodeFor(levels.slice(1), item, level+1, searchResults, collection, taxonomyURI, key);
        }
        return child;
    }    
}