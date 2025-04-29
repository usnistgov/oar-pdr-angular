import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { AccesspagePubComponent } from './accesspage-pub.component';

describe('AccesspagePubComponent', () => {
  let component: AccesspagePubComponent;
  let fixture: ComponentFixture<AccesspagePubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesspagePubComponent],
      providers: [ GoogleAnalyticsService ]
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
