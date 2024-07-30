import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StepWizardComponent } from './startwiz/stepwizard.component';

const routes: Routes = [
    { path: '', component: StepWizardComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
