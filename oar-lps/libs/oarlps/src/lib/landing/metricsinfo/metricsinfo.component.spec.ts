import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/core';
import { MetricsinfoComponent } from './metricsinfo.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as env from '../../../environments/environment';

describe('MetricsinfoComponent', () => {
    let component: MetricsinfoComponent;
    let fixture: ComponentFixture<MetricsinfoComponent>;
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();

    beforeEach(waitForAsync(() => {
        cfg = new AppConfig(null);
        cfg.loadConfig(env.config);
            
        TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, MetricsinfoComponent],
        providers: [
            { provide: AppConfig, useValue: cfg }
        ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MetricsinfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
