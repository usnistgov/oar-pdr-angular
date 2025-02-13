import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IspartofEditComponent } from './ispartof-edit.component';
import { AppConfig } from '../../../config/config'
import * as env from '../../../../environments/environment';
import { testdata } from '../../../../environments/environment';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';

describe('IspartofEditComponent', () => {
  let component: IspartofEditComponent;
  let fixture: ComponentFixture<IspartofEditComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(env.config);
  let nrd1 = testdata['forensics'];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IspartofEditComponent],
      providers: [
        MetadataUpdateService,
        UserMessageService,
        AuthService,
        DatePipe,
        GoogleAnalyticsService,
        { provide: AppConfig,       useValue: cfg } 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IspartofEditComponent);
    component = fixture.componentInstance;
    component.record = nrd1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
