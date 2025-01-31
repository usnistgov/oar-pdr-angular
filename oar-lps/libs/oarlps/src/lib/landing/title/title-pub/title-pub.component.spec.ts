import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TitlePubComponent } from './title-pub.component';

describe('TitlePubComponent', () => {
  let component: TitlePubComponent;
  let fixture: ComponentFixture<TitlePubComponent>;
  let record: any = require('../../../../assets/sampleRecord.json');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TitlePubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitlePubComponent);
    component = fixture.componentInstance;
    component.record = record;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
