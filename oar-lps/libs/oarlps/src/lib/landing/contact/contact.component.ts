import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ContactPubComponent } from './contact-pub/contact-pub.component';
import { ContactMidasComponent } from './contact-midas/contact-midas.component';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [ 
        ContactMidasComponent, 
        ContactPubComponent
    ],
    templateUrl: './contact.component.html',
    styleUrls: ['../landing.component.scss']
})
export class ContactComponent implements OnInit {
    @Input() record: any[];
    @Input() isPublicSite: boolean;  
    
    constructor()
    {    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }
}
