import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferencesComponent } from './references.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RefEditComponent } from './ref-edit/ref-edit.component';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DropdownModule } from 'primeng/dropdown';
import { LandingpageService } from '../landingpage.service';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { TextEditModule } from '../../text-edit/text-edit.module';
import { RefAuthorComponent } from './ref-author/ref-author.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RefListComponent } from './ref-list/ref-list.component';

@NgModule({
  declarations: [ReferencesComponent, RefEditComponent, RefAuthorComponent, RefListComponent],
  imports: [
    CommonModule,
    ToolbarModule,
    ToastrModule,
    ButtonModule,
    FormsModule,
    BrowserModule,
    DragDropModule,
    DropdownModule,
    CollapseModule,
    TextEditModule,
    NgbModule
  ],
  providers: [
    LandingpageService
  ],
  exports: [ReferencesComponent, RefAuthorComponent, RefListComponent]
})
export class ReferencesModule { }

export {
    ReferencesComponent, RefAuthorComponent, RefListComponent
}
