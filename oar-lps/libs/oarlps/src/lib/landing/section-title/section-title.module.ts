import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionTitleComponent } from './section-title.component';


@NgModule({
  declarations: [ SectionTitleComponent ],
  imports: [
    CommonModule
  ],
  exports: [ SectionTitleComponent ]
})
export class SectionTitleModule { }
