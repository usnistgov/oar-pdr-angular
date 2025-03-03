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
import { DAPService, LocalDAPService, createDAPService } from '../../../nerdm/dap.service';
import { NerdmRes } from '../../../nerdm/nerdm';
import { map, tap } from 'rxjs';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { config } from '../../../../environments/environment'
import { DAPModule } from '../../../nerdm/dap.module';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment-impl';

describe('IspartofEditComponent', () => {
    let component: IspartofEditComponent;
    let fixture: ComponentFixture<IspartofEditComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let nrd1 = testdata['forensics'];
    
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IspartofEditComponent, DAPModule],
      providers: [
        MetadataUpdateService,
        UserMessageService,
        AuthService,
        DatePipe,
        HttpHandler,
        GoogleAnalyticsService,
        { provide: AppConfig, useValue: cfg },
        { provide: DAPService, useFactory: createDAPService,
            deps: [ environment, HttpClient, AppConfig ] }, 
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
