import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IspartofPubComponent } from './ispartof-pub.component';

describe('IspartofPubComponent', () => {
  let component: IspartofPubComponent;
  let fixture: ComponentFixture<IspartofPubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IspartofPubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IspartofPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
