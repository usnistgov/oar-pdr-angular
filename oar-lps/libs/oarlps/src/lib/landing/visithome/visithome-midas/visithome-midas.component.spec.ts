import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisithomeMidasComponent } from './visithome-midas.component';
import { AppConfig } from '../../../config/config';
import { AngularEnvironmentConfigService } from '../../../config/config.service';
import { TransferState } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { env } from '../../../../environments/environment';

describe('VisithomeMidasComponent', () => {
    let component: VisithomeMidasComponent;
    let fixture: ComponentFixture<VisithomeMidasComponent>;
        let cfg: AppConfig;
        let plid: Object = "browser";
        let ts: TransferState = new TransferState();
        let authsvc: AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
        cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
        cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        cfg.status = "Unit Testing";
        cfg.appVersion = "2.test";

        TestBed.configureTestingModule({
        imports: [
            VisithomeMidasComponent,
            ToastrModule.forRoot()
        ],
        providers: [
            MetadataUpdateService,
            UserMessageService,
            DatePipe,
            GoogleAnalyticsService,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc }
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(VisithomeMidasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
