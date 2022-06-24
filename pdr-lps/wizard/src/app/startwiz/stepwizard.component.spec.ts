import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepWizardComponent } from './stepwizard.component';

describe('WizardComponent', () => {
  let component: StepWizardComponent;
  let fixture: ComponentFixture<StepWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepWizardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
