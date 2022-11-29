import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspageComponent } from './accesspage.component';

describe('AccesspageComponent', () => {
  let component: AccesspageComponent;
  let fixture: ComponentFixture<AccesspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
