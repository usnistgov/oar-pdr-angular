import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspageEditComponent } from './accesspage-edit.component';

describe('SingleApageComponent', () => {
  let component: AccesspageEditComponent;
  let fixture: ComponentFixture<AccesspageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspageEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
