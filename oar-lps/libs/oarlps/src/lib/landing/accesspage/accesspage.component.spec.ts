import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccesspageComponent } from './accesspage.component';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/platform-browser';
import * as env from '../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';

describe('AccesspageComponent', () => {
  let component: AccesspageComponent;
  let fixture: ComponentFixture<AccesspageComponent>;
  let cfg: AppConfig;
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspageComponent ],
      imports: [ HttpClientTestingModule, NoopAnimationsModule, ToastrModule.forRoot() ],
      providers: [ 
        MetadataUpdateService, 
        DatePipe,
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        UserMessageService,
        GoogleAnalyticsService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
