import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefEditComponent } from './ref-edit.component';

describe('SingleRefComponent', () => {
  let component: RefEditComponent;
  let fixture: ComponentFixture<RefEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
