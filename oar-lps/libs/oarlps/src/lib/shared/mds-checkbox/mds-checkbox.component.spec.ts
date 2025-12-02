import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdsCheckboxComponent } from './mds-checkbox.component';

describe('MdsCheckboxComponent', () => {
  let component: MdsCheckboxComponent;
  let fixture: ComponentFixture<MdsCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdsCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdsCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
