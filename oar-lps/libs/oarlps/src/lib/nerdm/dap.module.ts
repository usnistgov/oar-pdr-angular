import { NgModule, ModuleWithProviders, APP_INITIALIZER, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap, catchError, of } from 'rxjs';

import { AppConfig } from '../config/config';
import { DAPConfig, LPSConfig } from '../config/config.model';
import { ConfigurationService, AuthenticationService, ConfigModule, AuthModule } from 'oarng';
import { MIDASDAPService, DAPService, createDAPService } from './dap.service';
import { environment } from '../../environments/environment-impl';
import { IEnvironment } from '../../environments/ienvironment';
import { NerdmModule } from './nerdm.module';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

/**
 * a factory function provided to the Angular injection framework to set-up the DAPService.  
 */
function dapSetupFactory(
    cfgsvc: ConfigurationService,
    authsvc: AuthenticationService,
    injector: Injector,
    dapsvc?: MIDASDAPService)
{
    //Check if we are already on the internal error page.  
    // If so, skip the DAP setup to avoid a potential loop of errors and reroutes.
    let document: Document|null = null;
    try {
        document = injector.get(DOCUMENT) as Document;
    } catch (e) {
        console.log("No router available to reroute on error. ("+e.message+")");
    }
    
    if(document.location.href.includes('/int-error')) {
        console.log("Already on internal error page, skipping DAP setup.");
        return () => Promise.resolve();
    }

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

                //Display an alert to the user.  This is a bit of a hack, but it is intended to be a last-ditch effort to provide some feedback to the user about what went wrong.
                alert("Failed to setup DAP service: " + msg);

                // Redirect to general error page.
                let router : Router|null = null
                try {
                    router = injector.get(Router) as Router;
                } catch (e) {
                    console.log("No router available to reroute on error. ("+error.message+")");
                }

                if (router) {
                    router.navigateByUrl("/int-error", { skipLocationChange: true });
                } else {
                    console.log("No router available to reroute on error. ("+error.message+")");
                }

                return of(error);
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
          deps: [ AppConfig, AuthenticationService, Injector, DAPService ], multi: true }
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
