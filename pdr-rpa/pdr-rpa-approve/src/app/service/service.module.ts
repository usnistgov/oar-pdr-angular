import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigModule } from 'oarng';
import { RPAService } from './rpa.service';

@NgModule({
    imports: [ ConfigModule ],
    providers: [
        RPAService
    ]
})
export class ServiceModule { }

export { RPAService }
