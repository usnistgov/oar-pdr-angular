import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { ConfirmationDialogService } from './confirmation-dialog.service';

@NgModule({
    imports: [CommonModule, MatDialogModule],
    providers: [
        ConfirmationDialogService
    ]
})
export class ConfirmationDialogModule { }