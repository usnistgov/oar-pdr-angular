import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { RefMidasComponent } from '../ref-midas/ref-midas.component';
import { RefListComponent } from '../ref-list/ref-list.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { config, testdata } from '../../../../environments/environment';
import { NerdmRes, NerdmComp } from '../../../nerdm/nerdm';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';

describe('RefMidasComponent', () => {
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let authsvc: AuthService = new MockAuthService(undefined);
    let rec : NerdmRes = testdata['test1'];
    let component: RefMidasComponent;
    let fixture: ComponentFixture<RefMidasComponent>;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ RefListComponent ],
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
                    }
                ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(RefMidasComponent);
        component = fixture.componentInstance;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
