import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordPubComponent } from './keyword-pub.component';

describe('KeywordPubComponent', () => {
  let component: KeywordPubComponent;
  let fixture: ComponentFixture<KeywordPubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeywordPubComponent]
    })
    .compileComponents();

    let record: any = require('../../../../assets/sampleRecord.json');
    fixture = TestBed.createComponent(KeywordPubComponent);
    component = fixture.componentInstance;
    component.record = record;
    component.inBrowser = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
