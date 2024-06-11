export interface DataModel {
    resourceType?: string;
    provideLink?: boolean;
    softwareLink?: string;
    creatorIsContact?: boolean;
    contactName?: string;
    willUpload?: boolean;
    assocPageType?: string;
    recordname?: string;
    partOfCollection?: boolean;
    collections?: string[];
}

export interface CollectionDataModel {
    id: number;
    displayName: string;
    value: string;
}