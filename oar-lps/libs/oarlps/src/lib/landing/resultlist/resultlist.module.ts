import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultlistComponent } from './resultlist.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ResultitemComponent } from '../resultitem/resultitem.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [ResultlistComponent, ResultitemComponent],
  imports: [
    CommonModule, ButtonModule, FormsModule, DropdownModule, FontAwesomeModule
  ],
  exports: [
    ResultlistComponent, ResultitemComponent
  ]
})
export class ResultlistModule { }
