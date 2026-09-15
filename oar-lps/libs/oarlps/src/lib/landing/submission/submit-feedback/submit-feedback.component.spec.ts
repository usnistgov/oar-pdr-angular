import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { SubmitFeedbackComponent } from './submit-feedback.component';

describe('SubmitFeedbackComponent', () => {
  let component: SubmitFeedbackComponent;
  let fixture: ComponentFixture<SubmitFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitFeedbackComponent, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
