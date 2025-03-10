import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisithomeMidasComponent } from './visithome-midas.component';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import * as env from '../../../../environments/environment';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';

describe('VisithomeMidasComponent', () => {
    let component: VisithomeMidasComponent;
    let fixture: ComponentFixture<VisithomeMidasComponent>;
    let cfg : AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let authsvc: AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        imports: [
            VisithomeMidasComponent,
            ToastrModule.forRoot()
        ],
        providers: [
            UserMessageService, 
            HttpHandler,
            DatePipe,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            { provide: DAPService, useFactory: createDAPService, 
                deps: [ env, HttpClient, AppConfig ] },
            { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                new UserMessageService(), edstatsvc, dapsvc, null)
            },
            GoogleAnalyticsService,
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
