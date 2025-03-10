import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { AccesspageEditComponent } from './accesspage-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { environment } from '../../../../environments/environment-impl';
import { EditStatusService } from '../../editcontrol/editstatus.service';


describe('SingleApageComponent', () => {
    let component: AccesspageEditComponent;
    let fixture: ComponentFixture<AccesspageEditComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    let record: any = require('../../../../assets/sampleRecord.json');
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ ],
            imports: [ HttpClientTestingModule, ToastrModule.forRoot(), AccesspageEditComponent ],
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
        fixture = TestBed.createComponent(AccesspageEditComponent);
        component = fixture.componentInstance;
        component.accessPage = record;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
