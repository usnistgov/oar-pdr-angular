import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as Globals from '../../shared/globals/globals'
import { D3Service } from '../../shared/d3-service/d3.service';
import { CollectionService } from '../../shared/collection-service/collection.service';

@Component({
    selector: 'lib-section-title',
    templateUrl: './section-title.component.html',
    styleUrls: ['./section-title.component.css']
})
export class SectionTitleComponent {
    collection: string;
    svg: any;
    colorScheme: Globals.ColorScheme;
    sectionWidth: number;
    backColor: string = '#003c97';

    @Input() sectionTitle: string = "Hello"; 
    @Input() inBrowser: boolean = false;
    @Input() sectionTag: string;
   
    public constructor(
        public globalService: Globals.GlobalService,
        public collectionService: CollectionService,
        public d3Service: D3Service) {

        this.globalService.watchCollection((collection) => {
            this.collection = collection;
        });
    }

    ngOnInit(): void {
        this.collectionService.loadAllCollections();
        this.colorScheme = this.collectionService.getColorScheme(this.collection);
    }

    ngAfterViewInit(): void {
        let width = this.globalService.getTextWidth(this.sectionTitle)
        this.sectionWidth = width;

        if(this.inBrowser && this.colorScheme)
            this.d3Service.drawSectionHeaderBackground(this.svg, this.sectionTitle, this.sectionWidth, this.colorScheme.default, width, "#"+this.sectionTag);    
    }

}
