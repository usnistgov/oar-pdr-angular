import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisithomeComponent } from './visithome.component';
import { VisithomePopupComponent } from './visithome-popup/visithome-popup.component';
import { FormsModule } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';

import { DirectivesModule } from '../../directives/directives.module';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
    declarations: [ VisithomeComponent, VisithomePopupComponent ],
    imports: [
        CommonModule,
        ToolbarModule,
        FormsModule,
        ToastrModule,
        DirectivesModule,
        ButtonModule,
        TooltipModule
    ],
    exports: [
        VisithomeComponent, VisithomePopupComponent
    ]
})
export class VisithomeModule { }

export {
    VisithomeComponent, VisithomePopupComponent
};