import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilitatorsComponent } from './facilitators.component';
import { AuthorModule } from '../author/author.module';

@NgModule({
  declarations: [FacilitatorsComponent],
  imports: [
    CommonModule, AuthorModule
  ],
  exports: [
    FacilitatorsComponent
  ]
})
export class FacilitatorsModule { }

export {
    FacilitatorsComponent
};