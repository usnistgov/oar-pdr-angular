import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextEditComponent } from './text-edit.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [TextEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    BrowserModule
  ],
  exports: [TextEditComponent]
})
export class TextEditModule { }
export {
    TextEditComponent
};