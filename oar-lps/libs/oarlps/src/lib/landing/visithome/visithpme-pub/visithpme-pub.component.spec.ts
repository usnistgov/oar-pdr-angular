import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisithpmePubComponent } from './visithpme-pub.component';

describe('VisithpmePubComponent', () => {
  let component: VisithpmePubComponent;
  let fixture: ComponentFixture<VisithpmePubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisithpmePubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisithpmePubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
