export interface DataModel {
    resourceType?: string;
    provideLink?: boolean;
    softwareLink?: string;
    creatorIsContact?: boolean;
    contact?: ContactDataModel;
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

export interface ContactDataModel {
    name: string;
    email: string;
}