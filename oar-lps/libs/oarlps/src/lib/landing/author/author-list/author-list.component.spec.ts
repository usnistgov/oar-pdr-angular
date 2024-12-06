import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorListComponent } from './author-list.component';
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

describe('AuthorListComponent', () => {
  let component: AuthorListComponent;
  let fixture: ComponentFixture<AuthorListComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(env.config);
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorListComponent ],
      imports: [ HttpClientTestingModule, NoopAnimationsModule, ToastrModule.forRoot() ],
      providers: [ 
        MetadataUpdateService, 
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        UserMessageService,
        DatePipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    let record: any = require('../../../../assets/sampleRecord.json');
    fixture = TestBed.createComponent(AuthorListComponent);
    component = fixture.componentInstance;
    component.record = record;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
