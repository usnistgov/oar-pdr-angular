import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'angular-archwizard';

import { WizardModule } from 'oarng';
import { StepWizardComponent } from './stepwizard.component';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        ArchwizardModule,
        WizardModule,
        ComponentsModule,
        RouterModule
    ],
    declarations: [
        StepWizardComponent
    ],
    exports: [
        StepWizardComponent
    ]
})
export class StepWizModule { }
