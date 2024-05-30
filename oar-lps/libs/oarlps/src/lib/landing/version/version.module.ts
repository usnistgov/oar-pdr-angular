import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { VersionComponent } from './version.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

/**
 * module that provide support for rendering resource's version information
 */
@NgModule({
    imports: [
        CommonModule,
        CollapseModule,
        NgbModule,
        InputNumberModule,
        FormsModule
    ],
    declarations: [
        VersionComponent
    ],
    providers: [ ],
    exports: [
        VersionComponent
    ]
})
export class VersionModule { }

export {
    VersionComponent
};

    
