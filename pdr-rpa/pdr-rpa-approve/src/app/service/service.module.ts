import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigModule, CONFIG_URL, RELEASE_INFO } from 'oarng';
import { RPAService } from './rpa.service';
import { environment } from '../../environments/environment';
import { RELEASE } from '../../environments/release-info';

@NgModule({
    imports: [ ConfigModule ],
    providers: [
        { provide: RELEASE_INFO, useValue: RELEASE },
        { provide: CONFIG_URL, useValue: environment.configUrl },
        RPAService
    ]
})
export class ServiceModule { }

export { RPAService }
