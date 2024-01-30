import { APP_INITIALIZER } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { ServiceModule, RPAService } from './service.module';
import { ConfigurationService } from 'oarng';
import { ApprovalResponse, RecordWrapper } from '../model/record';

describe('ServiceModule', () => {
    let service: RPAService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule, ServiceModule ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(RPAService);
        let req = httpMock.expectOne('assets/config.json');
        req.flush({
            baseUrl: "http://goober.net/"
        });
        
        TestBed.inject(APP_INITIALIZER);
    });    

    it('baseURL is correctly set', () => {
        expect(service.baseUrl).toEqual("http://goober.net/");
    });

    it('configURL has been set correctly', () => {
        let cfgsvc: ConfigurationService = TestBed.inject(ConfigurationService);
        expect(cfgsvc.configUrl).toBe('assets/config.json');
    });

});

