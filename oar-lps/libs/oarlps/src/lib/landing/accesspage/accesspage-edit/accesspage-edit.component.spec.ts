import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { AccesspageEditComponent } from './accesspage-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('SingleApageComponent', () => {
  let component: AccesspageEditComponent;
  let fixture: ComponentFixture<AccesspageEditComponent>;
  let cfg: AppConfig;
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);
  let record: any = require('../../../../assets/sampleRecord.json');

  beforeEach(async () => {
    cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
    cfg.locations.pdrSearch = "https://goob.nist.gov/search";
    cfg.status = "Unit Testing";
    cfg.appVersion = "2.test";

    await TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ HttpClientTestingModule, ToastrModule.forRoot(), AccesspageEditComponent ],
      providers: [ 
        MetadataUpdateService, 
        DatePipe,
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        UserMessageService ]
    })
    .compileComponents();
  });

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
