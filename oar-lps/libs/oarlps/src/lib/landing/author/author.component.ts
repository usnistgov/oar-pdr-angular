import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from '../../shared/globals/globals';
import { AuthorPubComponent } from './author-pub/author-pub.component';
import { AuthorMidasComponent } from './author-midas/author-midas.component';

@Component({
    selector: 'app-author',
    standalone: true,
    imports: [
        AuthorMidasComponent,
        AuthorPubComponent
    ],
    templateUrl: './author.component.html',
    styleUrls: ['./author.component.css', '../landing.component.scss']
})
export class AuthorComponent implements OnInit {
    isPublicSite: boolean = false; 
    
    @Input() record: any[];
    @Input() isEditMode: boolean;

    constructor(
        public globalsvc: GlobalService) { 

    }

    ngOnInit() {
        this.isPublicSite = this.globalsvc.isPublicSite();
    }
}
