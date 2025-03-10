import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NerdmRes } from '../../nerdm/nerdm';
import { FacilitatorsComponent } from './facilitators.component';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { config, testdata } from '../../../environments/environment';
import { AppConfig } from '../../config/config';
import { LandingpageService } from '../landingpage.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { DatePipe } from '@angular/common';
import { AuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../nerdm/dap.service';

describe('FacilitatorsComponent', () => {
    let component: FacilitatorsComponent;
    let fixture: ComponentFixture<FacilitatorsComponent>;
    let rec : NerdmRes = testdata['test1'];
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let authsvc = new MockAuthService();  
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ FacilitatorsComponent ],
            providers: [
                LandingpageService,
                EditStatusService,
                UserMessageService, 
                HttpHandler,
                DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                { provide: DAPService, useFactory: createDAPService, 
                    deps: [ env, HttpClient, AppConfig ] },
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                    new UserMessageService(), edstatsvc, dapsvc, null)
                }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacilitatorsComponent);
        component = fixture.componentInstance;
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
