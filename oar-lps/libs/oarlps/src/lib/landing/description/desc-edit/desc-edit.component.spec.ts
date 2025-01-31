import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { DescEditComponent } from './desc-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';

describe('DescEditComponent', () => {
  let component: DescEditComponent;
  let fixture: ComponentFixture<DescEditComponent>;
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
        imports: [DescEditComponent],
        providers: [ 
            MetadataUpdateService, 
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            UserMessageService,
            DatePipe 
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
