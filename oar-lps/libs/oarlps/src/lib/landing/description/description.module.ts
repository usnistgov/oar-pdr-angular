import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';

import { DirectivesModule } from '../../directives/directives.module';
import { DescriptionComponent } from './description.component';
import { DescriptionPopupComponent } from './description-popup/description-popup.component';
import { ButtonModule } from 'primeng/button';
import { TextareaAutoresizeModule } from '../../textarea-autoresize/textarea-autoresize.module';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provides support for rendering and managing a resource's text description 
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        DirectivesModule,
        ButtonModule,
        NgbModule,
        TextareaAutoresizeModule,
        ToastrModule.forRoot()
    ],
    declarations: [
        DescriptionComponent, DescriptionPopupComponent
    ],
    providers: [
    ],
    exports: [
        DescriptionComponent, DescriptionPopupComponent
    ]
})
export class DescriptionModule { }

export {
    DescriptionComponent, DescriptionPopupComponent
};

    
