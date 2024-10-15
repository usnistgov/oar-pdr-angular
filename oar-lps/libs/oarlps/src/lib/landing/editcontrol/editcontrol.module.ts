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
import { AuthenticationService, AuthModule, StaffDirectoryService } from 'oarng';

@NgModule({
    declarations: [ EditControlComponent, EditStatusComponent ],
    imports: [ CommonModule, ConfirmationDialogModule, FrameModule, ButtonModule, OverlayPanelModule, TooltipModule, AuthModule ],
    exports: [ EditControlComponent, EditStatusComponent ],
    providers: [
        HttpClient,
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
