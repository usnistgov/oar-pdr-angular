import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContactEditComponent } from './contact-edit.component';
import { PeopleModule } from '../../people/people.module';
import { StaffDirectoryService, StaffDirModule, AuthenticationService } from 'oarng';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('ContactEditComponent', () => {
  let component: ContactEditComponent;
  let fixture: ComponentFixture<ContactEditComponent>;
    let service: StaffDirectoryService;
    let authsvc: AuthenticationService;
  let httpMock: HttpTestingController;
  let svcep : string = "https://mds.nist.gov/midas/nsd";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule, ContactEditComponent, PeopleModule, StaffDirModule ],
        providers: [ 
            StaffDirectoryService,
            AuthenticationService
        ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    let req = httpMock.expectOne('assets/config.json');
    req.flush({
        staffdir: {
            serviceEndpoint: svcep
        },
        auth: {
            serviceEndpoint: "https://auth.nist/"
        }
    });
  }));

  beforeEach(() => {
    service = TestBed.inject(StaffDirectoryService);
    authsvc = TestBed.inject(AuthenticationService);
    authsvc.setCredential({userId: "test",userAttributes:null, token:"fake token"});

    fixture = TestBed.createComponent(ContactEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
