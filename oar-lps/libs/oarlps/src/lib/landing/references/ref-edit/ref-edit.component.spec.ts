import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RefEditComponent } from './ref-edit.component';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/platform-browser';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SingleRefComponent', () => {
  let component: RefEditComponent;
  let fixture: ComponentFixture<RefEditComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(env.config);
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefEditComponent ],
      imports: [ HttpClientTestingModule, NoopAnimationsModule, ToastrModule.forRoot() ],
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
    fixture = TestBed.createComponent(RefEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
