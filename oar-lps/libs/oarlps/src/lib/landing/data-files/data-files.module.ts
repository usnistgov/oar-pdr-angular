import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TreeTableModule } from 'primeng/treetable';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * module that provides support for rendering the listing of data file
 */
@NgModule({
    imports: [
        CommonModule, RouterModule, BadgeModule,
        TreeTableModule, OverlayPanelModule, ProgressSpinnerModule, 
        ButtonModule, TooltipModule, NgbModule
    ],
    declarations: [

    ],
    providers: [ ],
    exports: [

    ]
})
export class DataFilesModule { }
