import { RouterModule, Routes } from '@angular/router';
import { LandingAboutComponent } from 'oarlps';
import { LandingPageComponent } from './landing/landingpage.component';
import { NoidComponent } from './landing/noid.component';

const routes: Routes = [
    // app paths
    { path: 'about',         component: LandingAboutComponent },
    { path: 'od/id',
      children: [
          { path: '',                component: NoidComponent          },
          { path: ':id',             component: LandingPageComponent   },
          { path: 'ark:/88434/:id',  component: LandingPageComponent   }
      ]
    },
]
