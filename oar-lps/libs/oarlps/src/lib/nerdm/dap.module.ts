import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs';

import { AppConfig } from './config.service';
import { DAPConfig } from './config.model';

/**
 * a factory function provided to the Angular injection framework to set-up the DAPService.  
 */
function dapSetupFactory(cfgsvc: ConfigurationService,
                         authsvc: AuthenticationService,
                         dapsvc?: DAPService)
{
    return () => {
        return cvgsvc.fetchConfig().pipe(
            switchMap(cfg => {
                return authsvc.fetchCredentials()
            }),
            tap(creds => {
                if (dapsvc?.authToken !== undefined)
                    dapsvc.authToken = creds.token;
            }),
            catchError(err => {
                let msg = "unknown cause";
                if (err instanceof HttpErrorResponse) {
                    msg = err.message || err.statusText
                    if (error.error instanceof Object && error.error["midas:message"])
                        msg = error.error["midas:message"]
                }
                console.error("Failed to setup DAP service: "+msg);
                throw err;
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
