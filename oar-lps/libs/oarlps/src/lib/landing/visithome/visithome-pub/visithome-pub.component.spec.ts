import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';

import { VisithomePubComponent } from './visithome-pub.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('VisithomePubComponent', () => {
  let component: VisithomePubComponent;
  let fixture: ComponentFixture<VisithomePubComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        imports: [VisithomePubComponent],
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),           
            GoogleAnalyticsService
        ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisithomePubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
