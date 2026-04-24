import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubmitConfirmComponent } from './submit-confirm.component';
import { MetadataUpdateService } from '../../../landing/editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { StaffDirectoryService, StaffDirModule, AuthenticationService } from 'oarng';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { ToastrService } from 'ngx-toastr';

describe('SubmitConfirmComponent', () => {
    let component: SubmitConfirmComponent;
    let fixture: ComponentFixture<SubmitConfirmComponent>;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
    let ps: StaffDirectoryService;
    let authsvc: AuthenticationService;
    let httpMock: HttpTestingController;
    let svcep : string = "https://mds.nist.gov/midas/nsd";

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ SubmitConfirmComponent, BrowserAnimationsModule, StaffDirModule, HttpClientTestingModule ],
            providers: [ 
                NgbActiveModal, 
                StaffDirectoryService,
                AuthenticationService,
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                                        edstatsvc, dapsvc, null, null)
                                    }
            ]
        })
        .compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        let req = httpMock.expectOne('assets/config.json');
        req.flush({
            staffdir: {
                serviceEndpoint: svcep
            }
        });
        ps = TestBed.inject(StaffDirectoryService);
        authsvc = TestBed.inject(AuthenticationService);
        authsvc.setCredential({userId: "test",userAttributes:null, token:"fake token"});

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SubmitConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
