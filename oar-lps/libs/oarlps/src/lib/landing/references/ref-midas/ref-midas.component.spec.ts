import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { RefMidasComponent } from '../ref-midas/ref-midas.component';
import { RefListComponent } from '../ref-list/ref-list.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { config, testdata } from '../../../../environments/environment';
import { NerdmRes, NerdmComp } from '../../../nerdm/nerdm';

describe('RefMidasComponent', () => {
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    let rec : NerdmRes = testdata['test1'];
            
    let component: RefMidasComponent;
    let fixture: ComponentFixture<RefMidasComponent>;

    beforeEach(waitForAsync(() => {
        cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
        cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        cfg.status = "Unit Testing";
        cfg.appVersion = "2.test";

        TestBed.configureTestingModule({
            imports: [ RefListComponent ],
            providers: [ 
                MetadataUpdateService, 
                DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                UserMessageService ]
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
