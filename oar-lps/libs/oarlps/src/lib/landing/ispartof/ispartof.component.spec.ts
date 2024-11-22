import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IspartofComponent } from './ispartof.component';

describe('IspartofComponent', () => {
  let component: IspartofComponent;
  let fixture: ComponentFixture<IspartofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IspartofComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IspartofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
