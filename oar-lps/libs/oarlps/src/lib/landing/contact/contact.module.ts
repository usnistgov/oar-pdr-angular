import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';

import { CollapseModule } from '../collapseDirective/collapse.module';
import { ContactComponent } from './contact.component';
import { ContactService } from './contact.service';
import { ButtonModule } from 'primeng/button';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provide support for rendering and managing a resource's 
 * contact information
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        CollapseModule,
        ButtonModule,
        NgbModule,
        ToastrModule.forRoot()
    ],
    declarations: [
        ContactComponent, ContactEditComponent
    ],
    providers: [
        ContactService
    ],
    exports: [
        ContactComponent, ContactEditComponent
    ]
})
export class ContactModule { }

export {
    ContactComponent, ContactService, ContactEditComponent
};

    
