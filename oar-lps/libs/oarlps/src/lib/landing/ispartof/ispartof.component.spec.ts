import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, DatePipe } from '@angular/common';

import { IspartofComponent } from './ispartof.component';
import * as env from '../../../environments/environment';
import { AppConfig } from '../../config/config';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { LandingpageService } from '../landingpage.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { AuthService, MockAuthService } from '../editcontrol/auth.service';
import { UserMessageService } from '../../frame/usermessage.service';

describe('IspartofComponent', () => {
  let component: IspartofComponent;
  let fixture: ComponentFixture<IspartofComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(env.config);
  let authsvc = new MockAuthService();  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IspartofComponent ],
      imports: [ CommonModule ],
      providers: [
        GoogleAnalyticsService,
        LandingpageService,
        EditStatusService,
        DatePipe,
        UserMessageService,
        { provide: AuthService, useValue: authsvc },
        MetadataUpdateService,
        { provide: AppConfig, useValue: cfg }
      ]
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
