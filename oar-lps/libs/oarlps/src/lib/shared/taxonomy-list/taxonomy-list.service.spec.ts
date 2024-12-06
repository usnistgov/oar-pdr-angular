import { TestBed } from '@angular/core/testing';

import { TaxonomyListService } from './taxonomy-list.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AppConfig } from '../../config/config'
import { TransferState } from '@angular/platform-browser';
import * as env from '../../../environments/environment';

describe('TaxonomyListService', () => {
    let cfg : AppConfig = new AppConfig(null);
    let plid : Object = "browser";
    let ts : TransferState = new TransferState();

    it('should be created', () => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterModule, RouterTestingModule],
            providers: [
                Location,
                { provide: AppConfig, useValue: cfg }
            ]
        })

        const service: TaxonomyListService = TestBed.inject(TaxonomyListService);
        expect(service).toBeTruthy();
    });
});
