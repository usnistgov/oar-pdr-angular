import { Injectable } from '@angular/core';
import { Themes, ThemesPrefs, Collections, Collection, ColorScheme, CollectionThemes } from '../../shared/globals/globals';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
    // Array to define the collection order
    collectionOrder: string[] = [];

    // list of collections for landing page display (topics)
    collectionForDisplay: string[] = [];

    allCollections: any = null;
    collectionData: any = null;

    constructor() {
    }

    serviceInit() {
        let that = this;
        this.collectionOrder = Object.keys(this.collectionData).sort(function(a,b){return that.collectionData[a]["displayOrder"]-that.collectionData[b]["displayOrder"]});
        this.collectionOrder = this.collectionOrder.filter(function(v) { return v !== 'default' });
        this.collectionForDisplay = Object.keys(this.collectionData).sort(function(a,b){return that.collectionData[a]["displayOrder"]-that.collectionData[b]["displayOrder"]}).filter(key => that.collectionData[key].landingPage); 
        this.loadAllCollections();
    }

    getCollectionOrder() {
        return this.collectionOrder;
    }

    getCollectionForDisplay() {
        return this.collectionForDisplay;
    }

    /**
     * Loads collection data from json file for nist and given collection
     * @param collection collection to be loaded
     * @returns collection object list that contains nist and collection data
     */
    loadAllCollections() {
        if (!this.collectionData) {
            console.log("No collection data loaded yet!");
        } else {
            if(!this.allCollections) {
                this.allCollections = {};

                for(let col of this.collectionOrder) {
                    this.allCollections[col] = this.loadCollection(col);
                    // this.colorSchemes[col] = this.allCollections[col].color;
                }
            }

            return this.allCollections;
        }

    }

    /**
     * Loads collection data from json file for given collection
     * @param collection collection to be loaded
     * @returns collection object
     */
    loadCollection(collection: string) {
        if(collection)
            return Object.assign(new Collection(), this.collectionData[collection]);  
        else    
            return Object.assign(new Collection(), this.collectionData[Collections.DEFAULT]);  
    }

    public setCollectionData(data: any) {
        this.collectionData = data;
        this.serviceInit();
    }

    public getCollectionData() {
        return this.collectionData;
    }
}
