import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';

import { MetricsinfoComponent } from './metricsinfo.component';

/**
 * module that provide support for rendering and editing a resource's title
 */
@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        MetricsinfoComponent
    ],
    providers: [
    ],
    exports: [
        MetricsinfoComponent
    ]
})
export class MetricsinfoModule { }

export {
    MetricsinfoComponent
};

    
