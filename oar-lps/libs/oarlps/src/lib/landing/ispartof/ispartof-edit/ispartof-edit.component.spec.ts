import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IspartofEditComponent } from './ispartof-edit.component';

describe('IspartofEditComponent', () => {
  let component: IspartofEditComponent;
  let fixture: ComponentFixture<IspartofEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IspartofEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IspartofEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
