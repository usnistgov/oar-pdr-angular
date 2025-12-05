import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingAboutComponent } from 'oarlps';
import { LandingPageComponent } from './landing/landingpage.component';
import { NoidComponent } from './landing/noid.component';
import { NerdmComponent, BulkDownloadComponent } from 'oarlps';
// import { SearchResolve } from './landing/search-service.resolve';
import { NotFoundComponent, InternalErrorComponent } from 'oarlps';
import { DatacartComponent } from 'oarlps';
import { DoneComponent } from 'oarlps';
import { DatacartRoutes } from 'oarlps';
import { MetricsComponent } from 'oarlps';
import { LeaveWhileDownloadingGuard } from 'oarlps';

const routes: Routes = [
    // ...DatacartRoutes,
    { path: '', redirectTo: '/about', pathMatch: 'full' },

    // Copied datacart routes here to test lazyloading
    { path: 'datacart',
      loadChildren: () => import('oarlps').then(m => m.DatacartModule),
    },
    // app paths
    { path: 'about',         component: LandingAboutComponent },
    { path: 'lps',
      children: [
          { path: '',                component: NoidComponent          },
          { path: '**',              component: LandingPageComponent   }
      ]
    },
    { path: 'nerdm',                 component: NerdmComponent         },
    // If ediid='global', local normal cart. Otherwise, load the cart with key=ediid
    // { path: 'datacart/:ediid',        component: DatacartComponent      },
    { path: 'done',         component: DoneComponent },
    // error paths
    { path: 'not-found',
      children: [
          { path: '',                component: NotFoundComponent      },
          { path: ':id',             component: NotFoundComponent      }
      ]
    },
    { path: 'int-error',
      children: [
          { path: '',                component: InternalErrorComponent },
          { path: ':id',             component: InternalErrorComponent }
      ]
    },
    { path: 'metrics/:id',         
        loadComponent: () => import('oarlps')
        .then(mod => mod.MetricsComponent),
    },
    { path: 'bulkdownload/:id',         component: BulkDownloadComponent },
    { path: '**',                    component: NotFoundComponent      }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledNonBlocking' })],
  exports: [RouterModule],
  // providers: [ SearchResolve ]
})
export class AppRoutingModule { }
