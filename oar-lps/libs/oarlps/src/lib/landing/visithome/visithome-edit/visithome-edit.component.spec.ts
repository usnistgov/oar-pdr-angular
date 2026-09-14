import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisithomeEditComponent } from './visithome-edit.component';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module

describe('VisithomeEditComponent', () => {
  let component: VisithomeEditComponent;
  let fixture: ComponentFixture<VisithomeEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ VisithomeEditComponent, FontAwesomeTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisithomeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
