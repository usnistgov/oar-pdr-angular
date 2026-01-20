import { Component, Input } from '@angular/core';
import { GlobalService, ColorScheme } from '../../shared/globals/globals'
import { D3Service } from '../../shared/d3-service/d3.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'lib-section-title',
    standalone: true,
    imports: [
        CommonModule
    ],    
    providers: [
        D3Service
    ],
    templateUrl: './section-title.component.html',
    styleUrls: ['./section-title.component.css']
})
export class SectionTitleComponent {
    collection: string;
    svg: any;
    colorScheme: any;
    sectionWidth: number;
    backColor: string = '#003c97';
    maxWidth: number = 1000;

    @Input() sectionTitle: string = "Hello"; 
    @Input() inBrowser: boolean = false;
    @Input() sectionTag: string;
   
    public constructor(
        public globalService: GlobalService,
        public d3Service: D3Service) {

        this.globalService.watchCollection((collection) => {
            this.collection = collection;
        });

        this.globalService.watchLpsLeftWidth(width => {
            this.maxWidth = width + 20;
        })

        this.globalService.watchColorPalette((colorPalette) => {
            this.colorScheme = colorPalette;
        })
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        let width = this.globalService.getTextWidth(this.sectionTitle)
        this.sectionWidth = width;

        if(this.inBrowser && this.colorScheme)
            this.d3Service.drawSectionHeaderBackground(this.svg, this.sectionTitle, this.sectionWidth, this.colorScheme.defaultVar, width, "#"+this.sectionTag);    
    }

}
