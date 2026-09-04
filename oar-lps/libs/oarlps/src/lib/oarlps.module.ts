import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameModule } from './frame/frame.module';
import { GoogleAnalyticsService} from "./shared/ga-service/google-analytics.service";
import { ConfigModule } from './config/config.module';
import { DatacartModule } from './datacart/datacart.module';
import { DirectivesModule } from './directives/directives.module';
import { ErrorsModule } from './errors/errors.module';
import { DoneModule } from './landing/done/done.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { TextareaAutoresizeModule } from './textarea-autoresize/textarea-autoresize.module';
import { SectionTitleModule } from './landing/section-title/section-title.module';
import { ToastrModule } from 'ngx-toastr';
import { NerdmModule } from './nerdm/nerdm.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FrameModule,
        ConfigModule,
        DirectivesModule,
        ErrorsModule,
        DoneModule,
        DragDropModule,
        HttpClientModule,
        TextareaAutoresizeModule,
        SectionTitleModule,
        DatacartModule,
        NerdmModule,
        ToastrModule.forRoot(),
    ],
    providers: [
        provideZoneChangeDetection({ ignoreChangesOutsideZone: true }),
        GoogleAnalyticsService,
    ],
    exports: [],
})
export class OARLPSModule {
    constructor(protected _googleAnalyticsService: GoogleAnalyticsService) {}
}
