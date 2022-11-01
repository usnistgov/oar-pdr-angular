import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferencesComponent } from './references.component';
import { ReferencesPopupComponent } from './references-popup/references-popup.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastrModule } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SingleRefComponent } from './single-ref/single-ref.component';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DragdropComponent } from './dragdrop/dragdrop.component';
import { DropdownModule } from 'primeng/dropdown';
import { LandingpageService } from '../landingpage.service';

@NgModule({
  declarations: [ReferencesComponent, ReferencesPopupComponent, SingleRefComponent, DragdropComponent],
  imports: [
    CommonModule,
    ToolbarModule,
    ToastrModule,
    ButtonModule,
    FormsModule,
    BrowserModule,
    DragDropModule,
    DropdownModule
  ],
  providers: [
    LandingpageService
  ],
  exports: [ReferencesComponent, ReferencesPopupComponent]
})
export class ReferencesModule { }

export {
    ReferencesComponent, ReferencesPopupComponent
}
