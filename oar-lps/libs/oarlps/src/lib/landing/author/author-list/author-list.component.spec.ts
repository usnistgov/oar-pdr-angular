import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorListComponent } from './author-list.component';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import * as env from '../../../../environments/environment';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StaffDirectoryService, StaffDirModule, ConfigurationService } from 'oarng';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { Configuration } from 'oarng';

describe('AuthorListComponent', () => {
    let component: AuthorListComponent;
    let fixture: ComponentFixture<AuthorListComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let authsvc: AuthService = new MockAuthService(undefined);
    let svcep : string = "https://mds.nist.gov/midas/nsd";
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
    let httpClient: HttpClient;
    let configService: ConfigurationService = new ConfigurationService(httpClient);

    const mockConfig: Configuration = {
        staffdir: {
            serviceEndpoint: svcep
        }
    };

    configService.config = mockConfig;

    beforeEach(() => {
        TestBed.configureTestingModule({
        declarations: [  ],
        imports: [ 
            AuthorListComponent, 
            HttpClientTestingModule, 
            NoopAnimationsModule, 
            StaffDirModule,
            ToastrModule.forRoot() ],
        providers: [ 
                    UserMessageService, 
                    HttpHandler,
                    DatePipe,
                    { provide: AppConfig, useValue: cfg },
                    { provide: AuthService, useValue: authsvc },
                    { provide: DAPService, useFactory: createDAPService, 
                        deps: [ env, HttpClient, AppConfig ] },
                    { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                        new UserMessageService(), edstatsvc, dapsvc, null)
                    },
                    { provide: StaffDirectoryService,useValue: new StaffDirectoryService(
                        httpClient, configService
                    )} 
                ]
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
