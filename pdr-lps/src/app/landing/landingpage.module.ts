import { NgModule }     from '@angular/core';
import { DatePipe }     from '@angular/common';
import { TaxonomyListService } from 'oarlps'
import { ErrorComponent, UserErrorComponent } from './error.component';
import { LandingpageService } from 'oarlps';

/**
 * A module supporting the complete display of landing page content associated with
 * a resource identifier
 */
@NgModule({
    imports: [
    ],
    declarations: [
        ErrorComponent, UserErrorComponent
    ],
    providers: [
        TaxonomyListService, 
        DatePipe,
        LandingpageService
    ],
    exports: [
        ErrorComponent, UserErrorComponent
    ]
})
export class LandingPageModule { }

export {
    ErrorComponent, UserErrorComponent };

