import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { ContactPubComponent } from './contact-pub.component';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module

describe('ContactPubComponent', () => {
  let component: ContactPubComponent;
  let fixture: ComponentFixture<ContactPubComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContactPubComponent, ToastrModule.forRoot(), FontAwesomeTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
