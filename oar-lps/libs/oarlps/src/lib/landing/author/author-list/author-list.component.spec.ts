import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthorListComponent } from './author-list.component';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StaffDirectoryService, StaffDirModule } from 'oarng';

describe('AuthorListComponent', () => {
  let component: AuthorListComponent;
  let fixture: ComponentFixture<AuthorListComponent>;
  let cfg: AppConfig = new AppConfig(null);
  cfg.loadConfig(env.config);
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();
  let authsvc: AuthService = new MockAuthService(undefined);
  let httpMock: HttpTestingController;
  let svcep : string = "https://mds.nist.gov/midas/nsd";
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [  ],
      imports: [ 
        AuthorListComponent, 
        HttpClientTestingModule, 
        NoopAnimationsModule, 
        StaffDirModule,
        ToastrModule.forRoot() ],
      providers: [ 
        MetadataUpdateService, 
        { provide: AppConfig, useValue: cfg },
        { provide: AuthService, useValue: authsvc },
        UserMessageService,
        DatePipe ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    let req = httpMock.expectOne('assets/config.json');

    req.flush({
        staffdir: {
            serviceEndpoint: svcep
        }
    });
  }));

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
