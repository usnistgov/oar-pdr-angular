export interface Reference {
    doi: string,
    refType: string,
    authors: string[],
    title: string,
    issued: string,
    label: string,  // Journal
    vol: string,
    volNumber: string,
    pages: number,
    location: string,
    citation: string,
    id: string,
    type: string[],
    dataChanged: boolean,
    isCollapsed: boolean
}