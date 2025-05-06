import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthorEditComponent } from './author-edit.component';
import { StaffDirectoryService, StaffDirModule } from 'oarng';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { Configuration, CONFIG_URL } from '../config/config.model';

describe('AuthorEditComponent', () => {
  let component: AuthorEditComponent;
  let fixture: ComponentFixture<AuthorEditComponent>;
  let service: StaffDirectoryService;
  let httpMock: HttpTestingController;
  let svcep : string = "https://mds.nist.gov/midas/nsd";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AuthorEditComponent, HttpClientTestingModule, StaffDirModule],
    //   providers: [ provide: CONFIG_URL, useValue: environment.configUrl ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    let req = httpMock.expectOne('assets/config.json');

    req.flush({
        staffdir: {
            serviceEndpoint: svcep
        }
    });
  }));

  beforeEach(() => {
    // service = TestBed.inject(StaffDirectoryService); 

    fixture = TestBed.createComponent(AuthorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    // This throws an error if there are any requests that haven't been flushed yet.
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
