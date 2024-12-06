import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { RefListComponent } from './ref-list.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { AppConfig } from '../../../config/config'
import { config } from '../../../../environments/environment'
import { DatePipe } from '@angular/common';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { ToastrModule } from 'ngx-toastr';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { NerdmRes } from '../../../nerdm/nerdm';
import { testdata } from '../../../../environments/environment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RefListComponent', () => {
  let component: RefListComponent;
  let fixture: ComponentFixture<RefListComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(config);
  let authsvc : AuthService = new MockAuthService(undefined);
  let rec : NerdmRes = testdata['test1'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefListComponent ],
      imports: [
        NoopAnimationsModule,
        ToastrModule.forRoot()],
      providers: [
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        MetadataUpdateService, 
        UserMessageService, 
        EditStatusService,
        DatePipe,
        AuthService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefListComponent);
    component = fixture.componentInstance;
    component.record = rec;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
