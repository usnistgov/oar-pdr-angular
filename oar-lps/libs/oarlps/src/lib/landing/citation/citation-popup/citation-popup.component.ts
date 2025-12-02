import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { CitationDisplayComponent } from '../citation-display/citation-display.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Themes, Collections } from '../../../shared/globals/globals';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { animate, style, transition, trigger } from '@angular/animations';

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
    styleUrl: './citation-popup.component.css',
        animations: [
        trigger(
        'enterAnimation', [
            transition(':enter', [
            style({height: '0px', opacity: 0}),
            animate('700ms', style({height: '100%', opacity: 1}))
            ]),
            transition(':leave', [
            style({height: '100%', opacity: 1}),
            animate('700ms', style({height: 0, opacity: 0}))
            //   animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
            ])
        ]
        )
    ]
})
export class CitationPopupComponent {
    allCollections: any = {};

    @Input() citetext : string;
    @Input() visible : boolean;
    @Input() width: number;
    @Input() collection: string = Collections.DEFAULT;
    @Output() visibleChange = new EventEmitter<boolean>();
    textCopied: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        public collectionService: CollectionService,
        private chref: ChangeDetectorRef) {
        
        this.allCollections = this.collectionService.loadAllCollections();
    }
    
    ngOnInit() {
        // console.log("citetext", this.citetext);
        // console.log("visible", this.visible);
        // console.log("width", this.width);
    }

    ngAfterViewInit() {
        this.chref.detectChanges();
    }
    ngOnChanges(changes: SimpleChanges): void {
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
    toggle(): void { this._setVisible(!this.visible); }
    
    close() 
    {
        this.activeModal.close('Close click');
    }

        /**
     * Return visit homepage button style
     * @returns 
     */
    btnStyle() {
        let color = this.allCollections[this.collection].color;

        return {
            '--button-text-color': 'white',
            '--button-color': color.defaultVar,
            '--hover-color': color.hoverVar,
            '--disable-color': 'var(--disabled-grey)',
            '--disable-text-color': 'var(--disabled-grey-text)'
        };
    }

    /**
     * Copy the given string to clipboard
     * @param val - input string to be copied to clipboard
     * @param command - indicate which command was copied so the command will be highlighted.
     */
    copyToClipboard(val: string){
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        this.textCopied = true;
        setTimeout(() => {
            this.textCopied = false;
        }, 2000);
    }    
}
