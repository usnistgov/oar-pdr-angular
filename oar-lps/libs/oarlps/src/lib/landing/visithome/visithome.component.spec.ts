import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisithomeComponent } from './visithome.component';

describe('VisithomeComponent', () => {
  let component: VisithomeComponent;
  let fixture: ComponentFixture<VisithomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisithomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisithomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
