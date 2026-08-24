import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DownloadstatusComponent } from './downloadstatus.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * module that provides support for rendering and managing a resource's text description
 */
@NgModule({
    imports: [
        CommonModule, MatProgressBarModule, FontAwesomeModule
    ],
    declarations: [
        DownloadstatusComponent
    ],
    providers: [
    ],
    exports: [
        DownloadstatusComponent
    ]
})
export class DownloadStatusModule { }

export {
    DownloadstatusComponent
};