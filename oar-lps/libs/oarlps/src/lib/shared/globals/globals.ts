
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
    "NORNAL": "normal",
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
}

//_fieldName is the field name in Nerdm record
let _fieldName = {};
_fieldName[Sections.DEFAULT_SECTION] = "title";
_fieldName[Sections.TITLE] = "title";
_fieldName[Sections.ACCESS_PAGES] = "components";
_fieldName[Sections.DESCRIPTION] = "description";
_fieldName[Sections.TOPICS] = "theme";
_fieldName[Sections.KEYWORDS] = "keyword";
_fieldName[Sections.IDENTITY] = "identity";
_fieldName[Sections.AUTHORS] = "identity";
_fieldName[Sections.FACILITATORS] = "identity";
_fieldName[Sections.ABOUT] = "about";
_fieldName[Sections.REFERENCES] = "references";
_fieldName[Sections.AUTHORS] = "authors";
_fieldName[Sections.DATA_ACCESS] = "dataAccess";
_fieldName[Sections.FACILITATORS] = "facilitators";
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
_displayName["theme"] = Sections.TOPICS;
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

export interface responseDetails {
    "id": string,       //a unique identifier for the finding
    "target": string,   //a name of a data property that the detected issue concerns; 
                        //this is the primary property that needs to be corrected
    "title": string,    //a short (e.g. single sentence) description or title for the detected issue
    "description": string[] //a more detailed description of the issue.  Each element in the list can be
                            //considered a different paragraph.  The first element should summarize the
                            //problem, while subsequent elements can provide tips on how to correct the issue.
}

export interface SubmitResponse {
    "action": string,   //e.g. "validate"
    "message": string,  //this will be the message that was provided in the input or a default message if not provided
    "validation": {
        "failures": responseDetails[],
        "warnings": responseDetails[],
        "recommendations": responseDetails[],
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