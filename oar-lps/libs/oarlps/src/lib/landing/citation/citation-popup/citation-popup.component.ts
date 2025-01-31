import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { CitationDisplayComponent } from '../citation-display/citation-display.component';

@Component({
    selector: 'lib-citation-popup',
    standalone: true,
    imports: [
        CommonModule, 
        ButtonModule, 
        DialogModule, 
        SharedModule,
        CitationDisplayComponent
    ],
    templateUrl: './citation-popup.component.html',
    styleUrl: './citation-popup.component.css'
})
export class CitationPopupComponent {
    @Input() citetext : string;
    @Input() visible : boolean;
    @Input() width: number;
    @Output() visibleChange = new EventEmitter<boolean>();

    ngOnInit() {
        console.log("citetext", this.citetext);
        console.log("visible", this.visible);
        console.log("width", this.width);
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log("citetext", this.citetext);
        console.log("visible", this.visible);
        console.log("width", this.width);
    }

    _setVisible(yesno : boolean) : void {
        this.visible = yesno;
        this.visibleChange.emit(this.visible);
    }        

    /** display the pop-up */
    show() : void { this._setVisible(true); }

    /** dismiss the pop-up */
    hide() : void { this._setVisible(false); }

    /** dismiss the pop-up */
    toggle() : void { this._setVisible(!this.visible); }
}
