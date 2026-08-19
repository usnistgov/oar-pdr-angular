import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchresultComponent } from './searchresult.component';
import { FiltersModule } from '../filters/filters.module';
import { ResultlistModule } from '../resultlist/resultlist.module';
import { MatTreeModule } from '@angular/material/tree';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SearchresultComponent],
  imports: [
    CommonModule,
    FiltersModule,
    ResultlistModule,
    MatTreeModule,
    MatDialogModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  exports: [
    SearchresultComponent
  ]
})
export class SearchresultModule { }