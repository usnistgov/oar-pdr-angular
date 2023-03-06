import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspageListComponent } from './accesspage-list.component';

describe('AccesspageComponent', () => {
  let component: AccesspageListComponent;
  let fixture: ComponentFixture<AccesspageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccesspageListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
