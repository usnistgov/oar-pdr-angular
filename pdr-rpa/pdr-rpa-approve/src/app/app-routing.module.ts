import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorsModule, NotFoundComponent } from 'oarlps';
import { AppComponent } from './app.component';

const routes: Routes = [
    {
        path: 'rpa',
        children: [
            { path: 'approve', component: AppComponent }
        ]
    },
    { path: '**', component: NotFoundComponent}
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

