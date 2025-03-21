import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspagePubComponent } from './accesspage-pub.component';

describe('AccesspagePubComponent', () => {
  let component: AccesspagePubComponent;
  let fixture: ComponentFixture<AccesspagePubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesspagePubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspagePubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
