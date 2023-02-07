export interface Reference {
    doi: string,
    refType: string,
    authors: string[],
    title: string,
    issued: string,
    publishYear: string,
    label: string,  // Journal
    vol: string,
    volNumber: string,
    pages: number,
    inPreparation: string,
    location: string,
    citation: string,
    id: string,
    type: string[],
    dataChanged: boolean,
    isCollapsed: boolean,
    isNew: boolean
}