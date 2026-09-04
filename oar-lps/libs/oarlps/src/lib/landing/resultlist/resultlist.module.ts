import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultlistComponent } from './resultlist.component';
import { FormsModule } from '@angular/forms';
import { ResultitemComponent } from '../resultitem/resultitem.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
@NgModule({
    declarations: [ResultlistComponent, ResultitemComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        FontAwesomeModule,
    ],
    exports: [ResultlistComponent, ResultitemComponent],
})
export class ResultlistModule {}
