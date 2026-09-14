import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { SubmitStatusNpsComponent } from './submit-status-nps.component';

describe('SubmitStatusNpsComponent', () => {
  let component: SubmitStatusNpsComponent;
  let fixture: ComponentFixture<SubmitStatusNpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [SubmitStatusNpsComponent],
        providers: [ GoogleAnalyticsService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitStatusNpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
