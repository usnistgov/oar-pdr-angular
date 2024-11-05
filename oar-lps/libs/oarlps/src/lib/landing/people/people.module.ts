import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleComponent } from './people.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [PeopleComponent],
    imports: [
        CommonModule, AutoCompleteModule, FormsModule
    ],
    exports: [
        PeopleComponent
    ]
})
export class PeopleModule { }
