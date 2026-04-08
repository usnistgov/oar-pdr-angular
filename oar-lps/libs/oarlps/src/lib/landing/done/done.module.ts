import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoneComponent } from './done.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [DoneComponent],
    imports: [
        CommonModule,
        FontAwesomeModule
    ],
    exports: [
        DoneComponent
    ]
})
export class DoneModule { }

export {
    DoneComponent
};
