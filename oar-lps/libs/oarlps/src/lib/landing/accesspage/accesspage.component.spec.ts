import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccesspageComponent } from './accesspage.component';

describe('AccesspageComponent', () => {
  let component: AccesspageComponent;
  let fixture: ComponentFixture<AccesspageComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
