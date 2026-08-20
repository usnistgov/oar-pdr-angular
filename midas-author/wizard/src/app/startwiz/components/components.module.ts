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
import { RecordNameComponent } from './recordname/recordname.component';
import { CollectionComponent } from './collection/collection.component';
import { PeopleComponent } from 'oarlps';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        AssociatedPapersComponent,
        SoftwareinfoComponent,
        PubtypeComponent,
        NavigatorComponent,
        FilesComponent,
        ContactinfoComponent,
        RecordNameComponent,
        CollectionComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WizardModule,
        PeopleComponent,
        FontAwesomeModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    exports: [
        AssociatedPapersComponent,
        SoftwareinfoComponent,
        PubtypeComponent,
        NavigatorComponent,
        FilesComponent,
        ContactinfoComponent,
        RecordNameComponent,
        CollectionComponent,
    ],
    providers: [FaIconLibrary],
})
export class ComponentsModule {}
