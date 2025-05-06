import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AccesspageListComponent } from './accesspage-list.component';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { environment } from '../../../../environments/environment-impl';
import { EditStatusService } from '../../editcontrol/editstatus.service';

describe('AccesspageListComponent', () => {
    let component: AccesspageListComponent;
    let fixture: ComponentFixture<AccesspageListComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc : AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        declarations: [ ],
        imports: [AccesspageListComponent, HttpClientTestingModule, NoopAnimationsModule, ToastrModule.forRoot() ],
        providers: [
            UserMessageService, 
            HttpHandler,
            DatePipe,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            { provide: DAPService, useFactory: createDAPService, 
                deps: [ environment, HttpClient, AppConfig ] },
            { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                new UserMessageService(), edstatsvc, dapsvc, null)
            } 
        ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AccesspageListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
