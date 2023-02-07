import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoneComponent } from './done.component';


@NgModule({
  declarations: [DoneComponent],
  imports: [
    CommonModule
  ],
  exports: [
    DoneComponent
  ]
})
export class DoneModule { }

export {
    DoneComponent
};
