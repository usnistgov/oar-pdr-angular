import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorsModule, NotFoundComponent } from 'oarlps';
import { RPARequestFormComponent } from './rpa/components/request-form.component';
import { RPASMEComponent } from './rpa/components/rpa-sme.component';
import { RPARoutes } from './rpa/rpa.routing';

const routes: Routes = [
    ...RPARoutes,
    { path: '**',                  component: NotFoundComponent        }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            initialNavigation: 'enabled',
            relativeLinkResolution: 'corrected'
        }),
        ErrorsModule
    ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }

