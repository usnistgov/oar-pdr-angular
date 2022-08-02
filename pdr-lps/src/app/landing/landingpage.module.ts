import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe }     from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NerdmModule } from '../nerdm/nerdm.module';
import { LandingPageComponent } from './landingpage.component';
import { LandingBodyComponent } from './landingbody.component';
import { NoidComponent } from './noid.component';
import { SectionsModule } from 'oarlps';
import { MetadataUpdateService } from 'oarlps';
import { EditControlModule } from 'oarlps';
import { ToolsModule } from 'oarlps';
import { CitationModule } from 'oarlps';
import { DoneModule } from 'oarlps';
import { TaxonomyListService } from 'oarlps'
import { ErrorComponent, UserErrorComponent } from './error.component';
// import { ForensicslandingbodyModule } from './forensicslandingbody/forensicslandingbody.module';
// import { ForensicssearchresultModule } from './forensicssearchresult/forensicssearchresult.module';
import { SearchresultModule } from 'oarlps';


/**
 * A module supporting the complete display of landing page content associated with 
 * a resource identifier
 */
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        NgbModule,
        NerdmModule,
        EditControlModule,
        ToolsModule,
        CitationModule,
        SectionsModule,
        SearchresultModule,
        DoneModule
    ],
    declarations: [
        LandingPageComponent, LandingBodyComponent, 
        ErrorComponent, UserErrorComponent, NoidComponent
    ],
    providers: [
        MetadataUpdateService, TaxonomyListService, DatePipe
    ],
    exports: [
        LandingPageComponent, LandingBodyComponent, 
        ErrorComponent, UserErrorComponent, NoidComponent
    ]
})
export class LandingPageModule { }

export { LandingPageComponent, LandingBodyComponent, 
    ErrorComponent, UserErrorComponent,NoidComponent };
    
