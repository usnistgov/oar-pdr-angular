import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { AccesspageMidasComponent } from './accesspage-midas.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AccesspageMidasComponent', () => {
    let component: AccesspageMidasComponent;
    let fixture: ComponentFixture<AccesspageMidasComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc : AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
    
        TestBed.configureTestingModule({
            imports: [
                AccesspageMidasComponent, 
                BrowserAnimationsModule,
                ToastrModule.forRoot()],
            providers: [
                MetadataUpdateService,
                UserMessageService,
                DatePipe,
                GoogleAnalyticsService,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(AccesspageMidasComponent);
        component = fixture.componentInstance;
        component.record = require('../../../../assets/sampleRecord.json');
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
