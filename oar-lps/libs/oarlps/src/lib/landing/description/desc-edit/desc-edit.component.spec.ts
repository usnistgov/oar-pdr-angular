import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { DescEditComponent } from './desc-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import * as env from '../../../../environments/environment';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';

describe('DescEditComponent', () => {
    let component: DescEditComponent;
    let fixture: ComponentFixture<DescEditComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let authsvc: AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [DescEditComponent],
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
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DescEditComponent);
        component = fixture.componentInstance;
        component.record = require('../../../../assets/sampleRecord.json');
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
