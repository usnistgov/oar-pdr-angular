import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisithomePopupComponent } from './visithome-popup.component';

describe('VisithomePopupComponent', () => {
  let component: VisithomePopupComponent;
  let fixture: ComponentFixture<VisithomePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisithomePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisithomePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
