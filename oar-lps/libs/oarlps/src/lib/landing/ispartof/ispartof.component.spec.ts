import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransferState } from '@angular/core';
import { IspartofComponent } from './ispartof.component';
import { AppConfig } from '../../config/config'
import { AngularEnvironmentConfigService } from '../../config/config.service';
import * as env from '../../../environments/environment';
import { testdata } from '../../../environments/environment';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService } from '../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';

describe('IspartofComponent', () => {
  let component: IspartofComponent;
  let fixture: ComponentFixture<IspartofComponent>;
  let plid : Object = "browser";
  let ts : TransferState = new TransferState();
  let cfg : AppConfig = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
  let nrd1 = testdata['forensics'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IspartofComponent ],
      providers: [ 
        MetadataUpdateService,
        UserMessageService,
        AuthService,
        DatePipe,
        GoogleAnalyticsService,
        { provide: AppConfig,       useValue: cfg } ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IspartofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
