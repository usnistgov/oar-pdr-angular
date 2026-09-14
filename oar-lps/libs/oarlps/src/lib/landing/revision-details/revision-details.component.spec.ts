import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionDetailsComponent } from './revision-details.component';
import { SubmissionData } from '../../shared/globals/globals';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module

describe('RevisionDetailsComponent', () => {
  let component: RevisionDetailsComponent;
  let fixture: ComponentFixture<RevisionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionDetailsComponent, FontAwesomeTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionDetailsComponent);
      component = fixture.componentInstance;
      component.submissionData = new SubmissionData();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
