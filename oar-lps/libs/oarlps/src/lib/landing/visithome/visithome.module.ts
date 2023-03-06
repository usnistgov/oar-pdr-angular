import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisithomeComponent } from './visithome.component';
// import { VisithomeEditComponent } from './visithome-edit/visithome-edit.component';
import { FormsModule } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';

import { DirectivesModule } from '../../directives/directives.module';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [ VisithomeComponent ],
    imports: [
        CommonModule,
        ToolbarModule,
        FormsModule,
        ToastrModule,
        DirectivesModule,
        ButtonModule,
        TooltipModule,
        NgbModule
    ],
    exports: [
        VisithomeComponent
    ]
})
export class VisithomeModule { }

export {
    VisithomeComponent
};