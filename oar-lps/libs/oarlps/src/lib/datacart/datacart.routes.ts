import { DatacartModule } from './datacart.module';
import { Routes, RouterModule } from '@angular/router';
import { DatacartComponent } from './datacart.component';
import { LeaveWhileDownloadingGuard } from './leave.guard';

export const DatacartRoutes: Routes = [

  {
    path: 'datacart',
    // Testing lazy load: (moved to midas-author/lps/app-routing)
    // loadChildren: () => import('./datacart.module').then(m => m.DatacartModule),
    children: [
        {   path: ':cartname',             
            // component: DatacartComponent,
            loadComponent: () => import('./datacart.component')
                .then(mod => mod.DatacartComponent),
            canDeactivate: [LeaveWhileDownloadingGuard]   },
        {   path: 'ark:/:naan/:cartname',  
            // component: DatacartComponent,
            loadComponent: () => import('./datacart.component')
                .then(mod => mod.DatacartComponent),
            canDeactivate: [LeaveWhileDownloadingGuard]   }
    ]
  }
];
