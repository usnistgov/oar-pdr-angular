import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersComponent } from './filters.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [FiltersComponent],
    imports: [
        CommonModule,
        MatTreeModule,
        MatDialogModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        TaxonomyModule,
        MatButtonModule,
        FontAwesomeModule,
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule
    ],
    exports: [FiltersComponent],
})
export class FiltersModule {}