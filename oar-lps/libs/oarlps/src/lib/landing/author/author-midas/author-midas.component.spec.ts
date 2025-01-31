import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthorMidasComponent } from './author-midas.component';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('AuthorMidasComponent', () => {
  let component: AuthorMidasComponent;
  let fixture: ComponentFixture<AuthorMidasComponent>;
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
      imports: [
        AuthorMidasComponent, 
        FormsModule, 
        ToastrModule.forRoot()],
      providers: [
        MetadataUpdateService,
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        UserMessageService,
        DatePipe 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorMidasComponent);
    component = fixture.componentInstance;
    component.record = require('../../../../assets/sampleRecord.json');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
