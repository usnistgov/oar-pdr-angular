import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { PanelModule } from 'primeng/panel';
import { RequestFormTermsComponent } from './request-form-terms.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RequestFormTermsComponent', () => {
  describe('RequestFormTermsComponent', () => {
    let component: RequestFormTermsComponent;
    let fixture: ComponentFixture<RequestFormTermsComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [RequestFormTermsComponent],
        imports: [BrowserModule, PanelModule, BrowserAnimationsModule],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(RequestFormTermsComponent);
      component = fixture.componentInstance;
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display panel if terms has at least one element', () => {
      component.terms = ['The database is to be used for demo related research, development and education.'];
      fixture.detectChanges();
      const panel = fixture.debugElement.query(By.css('p-panel'));
      expect(panel).toBeTruthy();
    });


    it('should render the terms and conditions list', () => {
      // Set the terms property to a test value
      component.terms = [
        'The database is to be used for demo related research, development and education.',
        'There should be no attempts to defeat the de-identification of the data provided.'
      ];

      // Call the ngOnInit method
      component.ngOnInit();

      // Trigger change detection
      fixture.detectChanges();

      // Get the HTML element that displays the terms and conditions list (by css class)
      const termsList = fixture.debugElement.query(By.css('.rpdform-form-terms-list'));

      // Verify that the element contains the correct number of terms
      expect(termsList.children.length).toBe(2);

      // Verify that each term is displayed correctly
      const term1 = termsList.children[0].nativeElement.textContent.trim();
      expect(term1).toBe('The database is to be used for demo related research, development and education.');

      const term2 = termsList.children[1].nativeElement.textContent.trim();
      expect(term2).toBe('There should be no attempts to defeat the de-identification of the data provided.');
    });

    it('should not display panel if terms is undefined or null or empty', () => {
      // Test for undefined
      component.terms = undefined;
      fixture.detectChanges();
      // Get the HTML element for the panel
      const panel = fixture.debugElement.query(By.css('p-panel'));
      expect(panel).toBeFalsy();

      // Test for null
      component.terms = null;
      fixture.detectChanges();
      const panel2 = fixture.debugElement.query(By.css('p-panel'));
      expect(panel2).toBeFalsy();

      // Test for empty
      component.terms = [];
      fixture.detectChanges();
      const panel3 = fixture.debugElement.query(By.css('p-panel'));
      expect(panel3).toBeFalsy();
    });
  });
});
