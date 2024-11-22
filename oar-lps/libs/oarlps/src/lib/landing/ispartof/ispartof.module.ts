import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IspartofComponent } from './ispartof.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [IspartofComponent],
  imports: [
    CommonModule,
    NgbModule
  ],
  exports: [IspartofComponent]
})
export class IspartofModule { }
