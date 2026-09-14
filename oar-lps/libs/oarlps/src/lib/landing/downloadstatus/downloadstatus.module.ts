import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DownloadstatusComponent } from './downloadstatus.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * module that provides support for rendering and managing a resource's text description 
 */
@NgModule({
    imports: [
        CommonModule, NgbModule, FontAwesomeModule
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

    
