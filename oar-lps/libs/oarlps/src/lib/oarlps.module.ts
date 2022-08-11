import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameModule } from './frame/frame.module';
import { AboutdatasetModule } from './landing/aboutdataset/aboutdataset.module';
import { GoogleAnalyticsService} from "./shared/ga-service/google-analytics.service";
import { ConfigModule } from './config/config.module';
import { DatacartModule } from './datacart/datacart.module';
import { DirectivesModule } from './directives/directives.module';
import { ErrorsModule } from './errors/errors.module';
import { SectionsModule } from './landing/sections/sections.module';
import { DoneModule } from './landing/done/done.module';
import { VisithomeComponent } from './landing/visithome/visithome.component';
import { VisithomePopupComponent } from './landing/visithome/visithome-popup/visithome-popup.component';

@NgModule({
    declarations: [
    VisithomeComponent,
    VisithomePopupComponent
  ],
    imports: [
        CommonModule, 
        FrameModule, 
        AboutdatasetModule,
        DatacartModule,
        ConfigModule,
        DirectivesModule,
        ErrorsModule,
        SectionsModule,
        DoneModule
    ],
    providers: [
        GoogleAnalyticsService
    ],
    exports: []
})
export class OARLPSModule { 
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { } 
}
