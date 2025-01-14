import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitlePubComponent } from './title-pub.component';

describe('TitlePubComponent', () => {
  let component: TitlePubComponent;
  let fixture: ComponentFixture<TitlePubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitlePubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitlePubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
