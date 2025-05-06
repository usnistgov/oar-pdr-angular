import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs';

import { AppConfig } from '../config/config';
import { DAPConfig, LPSConfig } from '../config/config.model';
import { ConfigurationService, AuthenticationService, ConfigModule, AuthModule } from 'oarng';
import { MIDASDAPService, DAPService, createDAPService } from './dap.service';
import { environment } from '../../environments/environment-impl';
import { IEnvironment } from '../../environments/ienvironment';
import { NerdmModule } from './nerdm.module';

/**
 * a factory function provided to the Angular injection framework to set-up the DAPService.  
 */
function dapSetupFactory(cfgsvc: ConfigurationService,
                         authsvc: AuthenticationService,
                         dapsvc?: MIDASDAPService)
{
    return () => {
        return cfgsvc.fetchConfig().pipe(
            switchMap(cfg => {
                return authsvc.fetchCredentials()
            }),
            tap(creds => {
                if (dapsvc?.authToken !== undefined)
                    dapsvc.authToken = creds.token;
            }),
            catchError(error => {
                let msg = "unknown cause";
                if (error instanceof HttpErrorResponse) {
                    msg = error.message || error.statusText
                    if (error.error instanceof Object && error.error["midas:message"])
                        msg = error.error["midas:message"]
                }
                console.error("Failed to setup DAP service: "+msg);
                throw error;
            })
        ).toPromise();
    }
}

/**
 * a service module providing an extension of the common ConfigurationService.  
 */
@NgModule({
    imports: [
        ConfigModule,
        AuthModule
    ],
    providers: [
        { provide: DAPService, useFactory: createDAPService,
          deps: [ environment, HttpClient, AppConfig ] },
        { provide: APP_INITIALIZER, useFactory: dapSetupFactory,
          deps: [ AppConfig, AuthenticationService, DAPService ], multi: true }
    ]
})
export class DAPModule {
    public static forRoot(env: IEnvironment): ModuleWithProviders<NerdmModule> {
        return {
          ngModule: NerdmModule,
          providers: [
            { provide: environment, useValue: env }
          ]
        };
    }
}

export { AppConfig, LPSConfig }
