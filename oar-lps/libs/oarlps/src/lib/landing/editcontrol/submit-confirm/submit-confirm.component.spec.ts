import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitConfirmComponent } from './submit-confirm.component';

describe('SubmitConfirmComponent', () => {
  let component: SubmitConfirmComponent;
  let fixture: ComponentFixture<SubmitConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitConfirmComponent ]
    })
    .compileComponents();
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
