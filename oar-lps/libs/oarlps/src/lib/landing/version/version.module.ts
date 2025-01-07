import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { VersionComponent } from './version.component';

/**
 * module that provide support for rendering resource's version information
 */
@NgModule({
    imports: [
        CommonModule,
        CollapseModule,
        NgbModule
    ],
    declarations: [

    ],
    providers: [ ],
    exports: [

    ]
})
export class VersionModule { }

export {

};

    
