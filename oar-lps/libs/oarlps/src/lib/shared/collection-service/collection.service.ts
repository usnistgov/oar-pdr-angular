import { Injectable } from '@angular/core';
import { Themes, ThemesPrefs, Collections, Collection, ColorScheme, CollectionThemes } from '../../shared/globals/globals';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

    constructor(private http: HttpClient) {}

    serviceInit() {
        let that = this;
        this.collectionOrder = Object.keys(this.collectionData).sort(function(a,b){return that.collectionData[a]["displayOrder"]-that.collectionData[b]["displayOrder"]});
        this.collectionOrder = this.collectionOrder.filter(function(v) { return v !== 'default' });
        this.collectionForDisplay = Object.keys(this.collectionData).sort(function(a,b){return that.collectionData[a]["displayOrder"]-that.collectionData[b]["displayOrder"]}).filter(key => that.collectionData[key].landingPage); 
        this.loadAllCollections();
    }

    public async loadLocalData(): Promise<any> { // Function must be async and return a Promise
        const dataUrl = './assets/collection/collections.json'; // Path to json file

        try {
                // Use firstValueFrom to convert the Observable to a Promise
                const data = await firstValueFrom(this.http.get<any>(dataUrl));
                console.log('Data loaded:', data);
                this.collectionData = data;
                this.serviceInit();
                return data;
            } catch (error) {
                console.error('Error loading local data:', error);
                throw error; // Handle errors with try/catch blocks
        }
    }

    getCollectionOrder() {
        return this.collectionOrder;
    }

    getCollectionForDisplay() {
        return this.collectionForDisplay;
    }

    getCollectionNameByID(collectionID: string) {
        if (!collectionID) return "None";
        
        if (this.collectionData) {
            const foundKey = Object.keys(this.collectionData).find(key => this.collectionData[key].id === collectionID);
            if(foundKey) {
                return this.collectionData[foundKey].value;
            } else {
                return "None";
            }
        }
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

    public getDefaultCollection() {
        if (!this.collectionData) {
            console.warn("No collection data loaded yet!");
            return {};
        } else {
            let key = Object.keys(this.collectionData).find(k => this.collectionData[k]['theme'] === 'default');
            if (key) {
                return this.loadCollection(key);
            } else {
                return {};
            }
        }
    }

    public loadColorPalettesFromJson(): Observable<any> {
        return this.http.get('./assets/collection/color-palettes.json');
    }

}
