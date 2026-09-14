import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionDetailsComponent } from './suggestion-details.component';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module
import { FaTestingConfig } from '@fortawesome/angular-fontawesome/testing';

describe('SuggestionDetailsComponent', () => {
  let component: SuggestionDetailsComponent;
  let fixture: ComponentFixture<SuggestionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [SuggestionDetailsComponent, FontAwesomeTestingModule],
        providers: [
            {
                provide: FaTestingConfig,
                useValue: {
                    caretRightIcon: 'undo',
                    caretDownIcon: 'undo'
                }
            }
        ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
