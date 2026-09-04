import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ManageFileConfirmComponent } from './manage-file-confirm/manage-file-confirm.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {

    constructor(private dialog: MatDialog) { }

    public confirm(
        title: string,
        message: string,
        showWarningIcon: boolean,
        showCancelButton: boolean = true,
        btnOkText: string = 'YES',
        btnCancelText: string = 'NO',
        dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
        let dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true; // equivalent to backdrop: 'static', keyboard: false
        dialogConfig.panelClass = "comfirmModalClass";
        dialogConfig.autoFocus = true;

        // Handle dialog size mapping
        if (dialogSize === 'sm') {
            dialogConfig.width = '500px';
            dialogConfig.maxWidth = '95vw';
        } else if (dialogSize === 'lg') {
            dialogConfig.width = '800px';
            dialogConfig.maxWidth = '95vw';
        }

        dialogConfig.data = {
            title: title,
            message: message,
            btnOkText: btnOkText,
            btnCancelText: btnCancelText,
            showWarningIcon: showWarningIcon,
            showCancelButton: showCancelButton,
        };

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
        // dialogRef.componentInstance.title = title;
        // dialogRef.componentInstance.message = message;
        // dialogRef.componentInstance.btnOkText = btnOkText;
        // dialogRef.componentInstance.btnCancelText = btnCancelText;
        // dialogRef.componentInstance.showWarningIcon = showWarningIcon;
        // dialogRef.componentInstance.showCancelButton = showCancelButton;

        return firstValueFrom(dialogRef.afterClosed());
    }

    /**
     * Currently not been used.
     * Open a popup dialog to confirm opening file manage page
     * @param title 
     * @param message 
     * @param dialogSize 
     * @returns 
     */
    public confirmManageFiles(
        title: string,
        message: string,
        dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
        let dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true; // equivalent to backdrop: 'static', keyboard: false
        dialogConfig.panelClass = "comfirmModalClass";

        // Handle dialog size mapping
        if (dialogSize === 'sm') {
            dialogConfig.width = '500px';
            dialogConfig.maxWidth = '95vw';
        } else if (dialogSize === 'lg') {
            dialogConfig.width = '800px';
            dialogConfig.maxWidth = '95vw';
        }

        const dialogRef = this.dialog.open(ManageFileConfirmComponent, dialogConfig);
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return firstValueFrom(dialogRef.afterClosed());
    }

    public displayMessage(
        title: string,
        message: string,
        showWarningIcon: boolean = false,
        showCancelButton: boolean = false,
        btnOkText: string = 'Close',
        btnCancelText: string = 'NO',
        dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
        let dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true; // equivalent to backdrop: 'static', keyboard: false
        dialogConfig.panelClass = "myCustomModalClass";

        // Handle dialog size mapping
        if (dialogSize === 'sm') {
            dialogConfig.width = '500px';
            dialogConfig.maxWidth = '95vw';
        } else if (dialogSize === 'lg') {
            dialogConfig.width = '1200px'; // wider for display messages
            dialogConfig.maxWidth = '95vw';
        }

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.btnOkText = btnOkText;
        dialogRef.componentInstance.btnCancelText = btnCancelText;
        dialogRef.componentInstance.showWarningIcon = showWarningIcon;
        dialogRef.componentInstance.showCancelButton = showCancelButton;

        return firstValueFrom(dialogRef.afterClosed());
    }

}