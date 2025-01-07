import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContactEditComponent } from './contact-edit.component';
import { PeopleModule } from '../../people/people.module';
import { StaffDirectoryService, StaffDirModule } from 'oarng';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('ContactEditComponent', () => {
  let component: ContactEditComponent;
  let fixture: ComponentFixture<ContactEditComponent>;
  let service: StaffDirectoryService;
  let httpMock: HttpTestingController;
  let svcep : string = "https://mds.nist.gov/midas/nsd";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule, ContactEditComponent, PeopleModule, StaffDirModule ],
        providers: [ 
            StaffDirectoryService
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
  });

  beforeEach(() => {
    service = TestBed.inject(StaffDirectoryService);

    fixture = TestBed.createComponent(ContactEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
