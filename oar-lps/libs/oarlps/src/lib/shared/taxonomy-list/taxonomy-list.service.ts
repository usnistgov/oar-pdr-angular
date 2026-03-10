import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppConfig } from '../../config/config';
import { CollectionService } from '../collection-service/collection.service';

/**
 * This class provides the TaxonomyList service with methods to read taxonomies and add names.
 */
@Injectable({
  providedIn: 'root'
})
export class TaxonomyListService {
    private taxonomyServiceBase : string = "";

    /**
     * Creates a new TaxonomyListService with the injected Http.
     * @param {HttpClient} http - The injected Http.
     * @constructor
     */
    constructor(
        private http: HttpClient,
        public collectionService: CollectionService,
        private cfg: AppConfig) {

        this.taxonomyServiceBase = cfg.get("links.taxonomyBase", "assets/collection/");
        if (! this.taxonomyServiceBase.endsWith("/"))
            this.taxonomyServiceBase += "/";
    }

    /**
     * Returns the list of taxonomies for a given collection and level. If collection is null, returns the default collection taxonomy list.
     * @param {string} collection - The collection to get the taxonomy for.
     * @param {number} level - The level of the taxonomy to get.
     * @return {string[]} The Observable for the HTTP request.
     */
    get(collection: string, level: number): Observable<any> {
        let taxonomyFileName = "";

        if (!collection) {
            taxonomyFileName = this.collectionService.getDefaultCollection()['taxonomyFileName'];
        } else {
            taxonomyFileName = this.collectionService.getCollectionData()[collection]['taxonomyFileName'];
        }

        if (level != 0)
            console.warn("taxonomy request level ignored")
        return this.http.get(this.taxonomyServiceBase + taxonomyFileName).pipe(
            map(taxon => { return taxon["vocab"]; })
        );    
    }

    /**
        * Handle HTTP error
        */
    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        error.message = errMsg;
        return throwError(() => error);
    }
}

