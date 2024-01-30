export class Author {
    "@id": string;
    familyName: string;
    givenName: string;
    middleName: string;
    fn: string;
    orcid: string;
    affiliation: any[];
    dataChanged: boolean;
    isCollapsed: boolean;
    isNew: boolean;
    fnLocked: boolean;
    orcidValid: boolean;

    constructor() {
        this.isNew = true;
        this.familyName = "";
        this.givenName = "";
        this.fn = "";
    }
}