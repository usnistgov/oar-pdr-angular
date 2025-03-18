import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingAboutComponent } from 'oarlps';
import { LandingPageComponent } from './landing/landingpage.component';
import { NoidComponent } from './landing/noid.component';
import { NerdmComponent } from 'oarlps';
import { NotFoundComponent, InternalErrorComponent } from 'oarlps';
import { DoneComponent } from 'oarlps';

const routes: Routes = [
    // ...DatacartRoutes,
    { path: '', redirectTo: '/about', pathMatch: 'full' },

    // app paths
    { path: 'about',         component: LandingAboutComponent },
    { path: 'od/id',
      children: [
          { path: '',                component: NoidComponent          },
          { path: ':id',             component: LandingPageComponent   },
          { path: 'ark:/88434/:id',  component: LandingPageComponent   }
      ]
    },
    { path: 'nerdm',                 component: NerdmComponent         },
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
    { path: '**',                    component: NotFoundComponent      }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledNonBlocking' })],
  exports: [RouterModule],
  // providers: [ SearchResolve ]
})
export class AppRoutingModule { }
