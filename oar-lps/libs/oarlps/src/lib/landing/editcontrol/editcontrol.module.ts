import { ModuleWithProviders, NgModule } from '@angular/core';
import { AuthService, createAuthService } from './auth.service';
import { AppConfig } from '../../config/config';
import { HttpClient } from '@angular/common/http';
import { IEnvironment } from '../../../environments/ienvironment';
import { environment } from '../../../environments/environment-impl';
import { AuthenticationService, AuthModule, StaffDirectoryService } from 'oarng';
import { DAPModule } from '../../nerdm/dap.module';
import { MetadataUpdateService } from './metadataupdate.service';
import { EditStatusService } from './editstatus.service';

@NgModule({
    declarations: [ ],
    imports: [ 
        AuthModule, 
        DAPModule
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
