import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe }     from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NerdmModule } from 'oarlps';
import { LandingPageComponent } from './landingpage.component';
// import { LandingBodyComponent } from './landingbody.component';
import { NoidComponent } from './noid.component';
import { MetadataUpdateService } from 'oarlps';
import { EditControlModule } from 'oarlps';
import { MenuComponent } from 'oarlps';
// import { CitationModule } from 'oarlps';
import { DoneModule } from 'oarlps';
import { TaxonomyListService } from 'oarlps'
import { ErrorComponent, UserErrorComponent } from './error.component';
// import { ForensicslandingbodyModule } from './forensicslandingbody/forensicslandingbody.module';
// import { ForensicssearchresultModule } from './forensicssearchresult/forensicssearchresult.module';
import { SearchresultModule } from 'oarlps';
import { WizardModule } from 'oarng';
import { SidebarModule } from 'oarlps';
import { DownloadStatusModule } from 'oarlps';
import { MetricsinfoComponent } from 'oarlps';
import { LandingpageService } from 'oarlps';
import { FrameModule } from 'oarlps';

/**
 * A module supporting the complete display of landing page content associated with
 * a resource identifier
 */
@NgModule({
    imports: [
        // CommonModule,
        // ButtonModule,
        // NgbModule,
        // NerdmModule,
        // EditControlModule,
        // ConfirmationDialogModule,
        // OverlayPanelModule,
        // AuthModule
        // MenuComponent,
        // CitationModule,
        // SearchresultModule,
        // DoneModule,
        // SidebarModule,
        // DownloadStatusModule,
        // MetricsinfoComponent,
        // FrameModule
    ],
    declarations: [
        ErrorComponent, UserErrorComponent
    ],
    providers: [
        MetadataUpdateService, TaxonomyListService, DatePipe,
        LandingpageService
    ],
    exports: [
        ErrorComponent, UserErrorComponent
    ]
})
export class LandingPageModule { }

export {
    ErrorComponent, UserErrorComponent };

