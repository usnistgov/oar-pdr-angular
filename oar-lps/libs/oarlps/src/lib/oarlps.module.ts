import { NgModule, provideZoneChangeDetection } from '@angular/core';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TextEditModule } from './text-edit/text-edit.module';
import { HttpClientModule } from '@angular/common/http';
import { TextareaAutoresizeModule } from './textarea-autoresize/textarea-autoresize.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SectionTitleModule } from './landing/section-title/section-title.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    declarations: [ ],
    imports: [
        CommonModule, 
        FrameModule, 
        AboutdatasetModule,
        ConfigModule,
        DirectivesModule,
        ErrorsModule,
        SectionsModule,
        DoneModule,
        DragDropModule,
        TextEditModule,
        HttpClientModule,
        TextareaAutoresizeModule,
        NgSelectModule,
        SectionTitleModule,
        DatacartModule,
        ToastrModule.forRoot()
    ],
    providers: [
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
        GoogleAnalyticsService
    ],
    exports: []
})
export class OARLPSModule { 
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) { } 
}
