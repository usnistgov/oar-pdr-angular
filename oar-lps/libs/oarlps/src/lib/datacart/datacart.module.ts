import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DownloadConfirmComponent } from './download-confirm/download-confirm.component';
import { CartcontrolComponent } from './cartcontrol/cartcontrol.component';
import { BundleplanComponent } from './bundleplan/bundleplan.component';
import { CartService } from "./cart.service";
import { DatacartComponent } from './datacart.component';
import { SharedModule } from '../shared/shared.module';
import { TreetableComponent } from './treetable/treetable.component';
import { LeaveWhileDownloadingGuard } from './leave.guard';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
// import { SelectionModel } from '@angular/cdk/collections';
// import { FlatTreeControl } from '@angular/cdk/tree';
import { TreeTableComponent } from '../tree-table/tree-table.component';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule
} from '@angular/material/tree';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    DatacartComponent,
    DownloadConfirmComponent,
    CartcontrolComponent,
    BundleplanComponent,
    TreetableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FontAwesomeModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TreeTableComponent
  ],
  exports: [DatacartComponent],
  providers: [CartService, LeaveWhileDownloadingGuard],
})
export class DatacartModule {}
