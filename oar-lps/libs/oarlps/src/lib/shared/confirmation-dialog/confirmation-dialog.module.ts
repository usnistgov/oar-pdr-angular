import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';  

import { ConfirmationDialogService } from './confirmation-dialog.service';
// import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@NgModule({
    declarations: [],
    imports: [NgbModule, CommonModule],
    exports: [],
    providers: [
        ConfirmationDialogService
    ]
})
export class ConfirmationDialogModule { }
