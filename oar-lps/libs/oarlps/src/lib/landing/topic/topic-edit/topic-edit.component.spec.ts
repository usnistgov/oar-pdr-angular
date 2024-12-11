import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { TopicEditComponent } from './topic-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('TopicEditComponent', () => {
  let component: TopicEditComponent;
  let fixture: ComponentFixture<TopicEditComponent>;
  let cfg: AppConfig;
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);

  beforeEach(async () => {
    cfg = new AppConfig(null);
    cfg.loadConfig(env.config)

    await TestBed.configureTestingModule({
      declarations: [ TopicEditComponent ],
      imports: [ HttpClientTestingModule, ToastrModule.forRoot() ],
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
    fixture = TestBed.createComponent(TopicEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
