import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { TextEditModule } from '../../text-edit/text-edit.module';
import { KeywordComponent } from './keyword.component';
import { TextareaAutoresizeModule } from '../../textarea-autoresize/textarea-autoresize.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provide support for rendering and managing a resource's list of 
 * applicable research topics
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        TextEditModule,
        TextareaAutoresizeModule,
        NgbModule,
        ToastrModule.forRoot()
    ],
    declarations: [
        KeywordComponent
    ],
    providers: [
    ],
    exports: [
        KeywordComponent
    ]
})
export class KeywordModule { }

export {
    KeywordComponent
};

    
