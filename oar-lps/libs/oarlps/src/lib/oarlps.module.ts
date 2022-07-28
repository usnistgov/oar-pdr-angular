import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameModule } from './frame/frame.module';
import { GoogleAnalyticsService} from "./shared/ga-service/google-analytics.service";

@NgModule({
    declarations: [],
    imports: [
        CommonModule, FrameModule
    ],
    providers: [
        GoogleAnalyticsService
    ],
    exports: []
})
export class OARLPSModule { 
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { } 
}
