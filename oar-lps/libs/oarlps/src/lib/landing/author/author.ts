export interface Author {
    "@id": string,
    familyName: string,
    givenName: string,
    middleName: string,
    fn: string,
    orcid: string,
    affiliation: any[],
    dataChanged: boolean,
    isCollapsed: boolean,
    isNew: boolean,
    fnLocked: boolean,
    orcidValid: boolean
}