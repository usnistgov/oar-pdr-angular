import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaAutoresizeModule } from '../../textarea-autoresize/textarea-autoresize.module';
// import { TitleComponent } from './title.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provide support for rendering and editing a resource's title
 */
@NgModule({
    imports: [
        CommonModule, 
        FormsModule,
        TextareaAutoresizeModule,
        NgbModule
    ],
    declarations: [

    ],
    providers: [
    ],
    exports: [

    ]
})
export class TitleModule { }

export {

};

    
