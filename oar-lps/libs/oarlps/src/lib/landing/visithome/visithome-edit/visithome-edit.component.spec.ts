import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisithomeEditComponent } from './visithome-edit.component';

describe('VisithomeEditComponent', () => {
  let component: VisithomeEditComponent;
  let fixture: ComponentFixture<VisithomeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisithomeEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisithomeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
