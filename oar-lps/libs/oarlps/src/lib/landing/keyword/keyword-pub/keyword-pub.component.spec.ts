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

    fixture = TestBed.createComponent(KeywordPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
