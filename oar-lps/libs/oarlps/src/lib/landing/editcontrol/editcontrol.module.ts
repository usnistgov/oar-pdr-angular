import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditControlComponent } from './editcontrol.component';
import { EditStatusComponent } from './editstatus.component';
import { AuthService, createAuthService } from './auth.service';
import { ConfirmationDialogModule } from '../../shared/confirmation-dialog/confirmation-dialog.module';
import { FrameModule } from '../../frame/frame.module';
import { ButtonModule } from 'primeng/button';
import { AppConfig } from '../../config/config';
import { HttpClient } from '@angular/common/http';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { IEnvironment } from '../../../environments/ienvironment';
import { environment } from '../../../environments/environment-impl';
import { TooltipModule } from 'primeng/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SubmitConfirmComponent } from './submit-confirm/submit-confirm.component';
import { AuthenticationService, AuthModule, StaffDirectoryService } from 'oarng';
import { DAPModule } from '../../nerdm/dap.module';
import { MetadataUpdateService } from './metadataupdate.service';
import { EditStatusService } from './editstatus.service';

@NgModule({
    declarations: [ ],
    imports: [ 
        // CommonModule, 
        // ConfirmationDialogModule, 
        // FrameModule, 
        // ButtonModule, 
        // OverlayPanelModule, 
        // TooltipModule, 
        AuthModule, 
        DAPModule
        // NgbModule, 
        // NgSelectModule, 
        // FormsModule 
    ],
    exports: [ ],
    providers: [
        HttpClient,
        MetadataUpdateService,
        EditStatusService,
        { provide: AuthService, useFactory: createAuthService, deps: [ environment, AppConfig, HttpClient, AuthenticationService, StaffDirectoryService ] }
    ]
})
export class EditControlModule { 
    public static forRoot(env: IEnvironment): ModuleWithProviders<EditControlModule> {

        return {
          ngModule: EditControlModule,
          providers: [
            { provide: environment, useValue: env }
          ]
        };
    } 
}
