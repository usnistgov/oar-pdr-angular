import { Injectable } from '@angular/core';
import { NerdmRes, NERDResource } from '../nerdm/nerdm';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

    constructor() { }

    getSuggestions(record: NerdmRes) {
        return ["title", "keyword", "references"];
    }
}
