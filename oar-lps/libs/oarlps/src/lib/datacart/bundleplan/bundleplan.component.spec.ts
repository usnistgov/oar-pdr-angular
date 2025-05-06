import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap' ; 
import { BundleplanComponent } from './bundleplan.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DownloadService } from '../../shared/download-service/download-service.service';
import { CartService } from '../cart.service';
import { TestDataService } from '../../shared/testdata-service/testDataService';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../environments/environment';

describe('BundleplanComponent', () => {
    let component: BundleplanComponent;
    let fixture: ComponentFixture<BundleplanComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        declarations: [ BundleplanComponent ],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            HttpClientTestingModule,
            NgbModule
        ],
        providers: [
            CartService,
            DownloadService,
            TestDataService,
            GoogleAnalyticsService,
            { provide: AppConfig, useValue: cfg }]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BundleplanComponent);
        component = fixture.componentInstance;
        component.emailSubject = "";
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getDownloadTime()', () => {
        expect(component.getDownloadTime(3661)).toEqual("1hour 1min 1sec");
    });

    it('getBackColor()', () => {
        expect(component.getBackColor(5)).toEqual("rgb(231, 231, 231)");
        expect(component.getBackColor(6)).toEqual("white");
    });

    it('getColor()', () => {
        component.bundlePlanStatus = 'warnings';
        expect(component.getColor()).toEqual("darkorange");

        component.bundlePlanStatus = 'error';
        expect(component.getColor()).toEqual("red");

        component.bundlePlanStatus = 'internal error';
        expect(component.getColor()).toEqual("red");

        component.bundlePlanStatus = '';
        expect(component.getColor()).toEqual("black");
    });
});
