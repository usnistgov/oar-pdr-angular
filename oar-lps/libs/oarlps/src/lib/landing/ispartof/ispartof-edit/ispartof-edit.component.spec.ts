import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IspartofEditComponent } from './ispartof-edit.component';
import { AppConfig } from '../../../config/config'
import * as env from '../../../../environments/environment';
import { testdata } from '../../../../environments/environment';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { DAPService, LocalDAPService, createDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { environment } from '../../../../environments/environment-impl';


describe('IspartofEditComponent', () => {
    let component: IspartofEditComponent;
    let fixture: ComponentFixture<IspartofEditComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let nrd1 = testdata['forensics'];
    let authsvc : AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
    
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IspartofEditComponent],
      providers: [
        UserMessageService, 
        HttpHandler,
        DatePipe,
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        { provide: DAPService, useFactory: createDAPService, 
            deps: [ environment, HttpClient, AppConfig ] },
        { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
            new UserMessageService(), edstatsvc, dapsvc, null)
        } 
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
