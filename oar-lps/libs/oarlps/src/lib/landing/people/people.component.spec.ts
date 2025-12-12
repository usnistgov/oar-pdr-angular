import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StaffDirectoryService, StaffDirModule, AuthenticationService } from 'oarng';
import { PeopleComponent } from './people.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('PeopleComponent', () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;
  let ps: StaffDirectoryService;
  let authsvc: AuthenticationService;
  let httpMock: HttpTestingController;
  let svcep : string = "https://mds.nist.gov/midas/nsd";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, StaffDirModule, PeopleComponent ],
      providers: [ 
          StaffDirectoryService,
          AuthenticationService
       ]
    }).compileComponents();

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

    fixture = TestBed.createComponent(PeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
