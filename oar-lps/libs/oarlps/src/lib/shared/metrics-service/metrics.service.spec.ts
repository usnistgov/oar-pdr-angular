import { inject, TestBed, waitForAsync  } from '@angular/core/testing';
import { AppConfig } from '../../config/config';
import { MetricsService } from './metrics.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TransferState } from '@angular/platform-browser';
import * as env from '../../../environments/environment';

describe('MetricsService', () => {
    let cfg: AppConfig = new AppConfig(null);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();

    beforeEach(waitForAsync(() => {
        let cfgd = {
            links: {
                orgHome: "https://pdr.org/",
                portalBase: "https://data.pdr.org/"
            },
            PDRAPIs: { },
            status: "Unit Testing",
            appVersion: "2.test"
        }
        cfg.loadConfig(cfgd);

        TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientTestingModule],
        providers: [
            { provide: AppConfig, useValue: cfg }
        ]

        })
        .compileComponents();
        // fakerecords = makeRMMData();
        // let options = new ResponseOptions({ status: 200, body: JSON.stringify(fakerecords) });
        // response = new Response(options);
    }));

    it('should be created', () => {
        const service: MetricsService = TestBed.inject(MetricsService);
        expect(service).toBeTruthy();
    });
});
