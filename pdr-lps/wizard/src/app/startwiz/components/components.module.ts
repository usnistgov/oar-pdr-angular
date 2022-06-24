import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssociatedPapersComponent } from './associated-papers/associated-papers.component';
import { WizardModule } from 'oarng';
import { SoftwareinfoComponent } from './softwareinfo/softwareinfo.component';
import { PubtypeComponent } from './pubtype/pubtype.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { FilesComponent } from './files/files.component';
import { ContactinfoComponent } from './contactinfo/contactinfo.component';

@NgModule({
    declarations: [
        AssociatedPapersComponent,
        SoftwareinfoComponent,
        PubtypeComponent,
        NavigatorComponent,
        FilesComponent,
        ContactinfoComponent
    ],
    imports: [
        CommonModule, 
        FormsModule,
        ReactiveFormsModule,
        WizardModule
    ],
    exports: [
        AssociatedPapersComponent,
        SoftwareinfoComponent,
        PubtypeComponent,
        NavigatorComponent,
        FilesComponent,
        ContactinfoComponent
    ]
})
export class ComponentsModule { }
