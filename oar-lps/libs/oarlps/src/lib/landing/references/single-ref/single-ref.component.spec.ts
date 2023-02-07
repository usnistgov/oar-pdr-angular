import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleRefComponent } from './single-ref.component';

describe('SingleRefComponent', () => {
  let component: SingleRefComponent;
  let fixture: ComponentFixture<SingleRefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleRefComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
