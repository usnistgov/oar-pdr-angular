import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccesspageListComponent } from './accesspage-list/accesspage-list.component';
import { SingleApageComponent } from './single-apage/single-apage.component';
import { TextEditModule } from '../../text-edit/text-edit.module';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DropdownModule } from 'primeng/dropdown';
import { LandingpageService } from '../landingpage.service';
import { CollapseModule } from '../collapseDirective/collapse.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccesspageComponent } from './accesspage.component';

@NgModule({
  declarations: [SingleApageComponent, AccesspageComponent, AccesspageListComponent],
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
  exports:[AccesspageComponent, AccesspageListComponent]
})
export class AccesspageModule { }

export {
    AccesspageComponent, AccesspageListComponent
};
