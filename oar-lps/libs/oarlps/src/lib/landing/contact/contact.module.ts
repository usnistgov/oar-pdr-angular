import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { ContactComponent } from './contact.component';
import { ButtonModule } from 'primeng/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provide support for rendering and managing a resource's 
 * contact information
 */
@NgModule({
    imports: [
        CommonModule,
        CollapseModule,
        ButtonModule,
        NgbModule,
        ToastrModule.forRoot()
    ],
    declarations: [
        ContactComponent
    ],
    exports: [
        ContactComponent
    ]
})
export class ContactModule { }

export {
    ContactComponent
};

    
