/**
 * A container for affiliation info
 */

export interface Affiliation {
    '@id': string,
    title: string,
    subunits: string[], // This is an array in NERDm but we convert it to string for UI editing purpose
    "@type": [string]
}

/**
 * A container for author info.
 */
export class Author {
    // Family name
    familyName: string;
    // Full name
    fn: string;
    // Given name
    givenName: string;
    // Middle name
    middleName: string;
    // Affiliation
    affiliation: Affiliation[];
    // Orcid
    orcid: string;
    // Valid ORCID flag
    orcidValid: boolean;
    // flag for UI control - determind if current author detail info is collapsed
    isCollapsed: boolean;
    // flag for UI control - determind if current author's full name is locked
    fnLocked: boolean;
    // flag for UI control - determind if current author's info has been changed
    dataChanged: boolean;

    constructor(
            givenName: string = "",
            familyName: string = "", 
            middleName: string = "", 
            fn: string = "", 
            affiliation: Affiliation[] = [],
            orcid: string = "") {

        this.affiliation = affiliation;
        this.familyName = familyName;
        this.givenName = givenName;
        this.middleName = middleName;
        this.fn = fn,
        this.affiliation = affiliation;
        this.orcid = orcid;
        this.orcidValid = true;
        this.isCollapsed = false;
        this.fnLocked = false;
        this.dataChanged = false;
    }  
    
    updateFullName() {
        this.fn = this.givenName + " " + (this.middleName == undefined ? "" : this.middleName + " ") + (this.familyName == undefined ? "" : this.familyName);
    }
}


// export class Author {
//     "@id": string;
//     familyName: string;
//     givenName: string;
//     middleName: string;
//     fn: string;
//     orcid: string;
//     affiliation: Affiliation[];
//     dataChanged: boolean;
//     isCollapsed: boolean;
//     isNew: boolean;
//     fnLocked: boolean;
//     orcidValid: boolean;

//     constructor() {
//         this.isNew = true;
//         this.familyName = "";
//         this.givenName = "";
//         this.fn = "";
//     }
// }

