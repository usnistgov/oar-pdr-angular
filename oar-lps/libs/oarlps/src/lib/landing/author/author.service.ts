import { Injectable } from '@angular/core';
import { Affiliation, Author } from './author';

@Injectable({
    providedIn: 'root'
})
export class AuthorService {

    constructor() { }

    public getBlankAffiliation(title: string): Affiliation {
        return {
            "@id": "",
            "title": title,
            "subunits": [""],
            "@type": [
                ""
            ]
        }
    }

    // public getBlankAuthor(): Author {
    //     return {
    //         new Author("", "", "", "", [this.getBlankAffiliation("")]);
    //     };
    // }
}


