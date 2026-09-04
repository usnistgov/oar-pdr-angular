import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitStatusComponent } from './submit-status.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

let submitStatus = {
    "nps1": {
        "phase": "approved",
        "updated": 1777575521.5050688,
        "@id": "1",
        "info_at": "https://tsapps-d.nist.gov/nps/npsui/ApproveDataset?id=147778-63",
        "feedback": [
        {
            "description": "Changes requested; visit NPS site for details"
        }
        ]
    },
    "testrev": {
        "phase": "Data Sponsor",
        "@id": "mds3:0001",
        "updated": 1777577976.3822532,
        "feedback": [
        {
            "reviewer": "unknown",
            "description": "Good description"
        }
        ]
    },
    "nps2": {
        "phase": "Review",
        "@id": "mds3:0001",
        "info_at": "https://tsapps-d.nist.gov/nps/npsui/ApproveDataset?id=147778-63",
        "updated": 1777578087.285341,
        "feedback": [
        {
            "reviewer": "ztt3",
            "type": "req",
            "description": "Please add ORCIDs"
        },
        {
            "reviewer": "ztt3",
            "type": "req",
            "description": "Please add a README"
        },
        {
            "reviewer": "grg2",
            "type": "warn",
            "description": "Consider using csv instead of xlsx"
        }
        ]
    }
};

describe('SubmitStatusComponent', () => {
  let component: SubmitStatusComponent;
  let fixture: ComponentFixture<SubmitStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [ SubmitStatusComponent, BrowserAnimationsModule ],
        providers: [ GoogleAnalyticsService ],
        schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitStatusComponent);
      component = fixture.componentInstance;
      component.submitStatus = submitStatus;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
