import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefPubComponent } from './ref-pub.component';

describe('RefPubComponent', () => {
  let component: RefPubComponent;
  let fixture: ComponentFixture<RefPubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefPubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
