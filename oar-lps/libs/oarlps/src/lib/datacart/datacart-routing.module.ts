import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatacartRoutes } from './datacart.routes';

const routes: Routes = [
    ...DatacartRoutes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class DatacartRoutingModule { }