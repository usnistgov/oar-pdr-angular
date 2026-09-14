import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SuggestionsComponent } from './suggestions.component';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module
import { FaTestingConfig } from '@fortawesome/angular-fontawesome/testing';

describe('SuggestionsComponent', () => {
  let component: SuggestionsComponent;
  let fixture: ComponentFixture<SuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [SuggestionsComponent, BrowserAnimationsModule, FontAwesomeTestingModule],
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

    fixture = TestBed.createComponent(SuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
