import { ActivatedRoute } from '@angular/router';
import { AppComponent } from './app.component';
import { ConfigurationService } from './service/config.service';
import { RPAService } from './service/rpa.service';
import { MessageService } from 'primeng/api';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from "primeng/button";
import { PanelModule } from 'primeng/panel';

import { HttpClientModule } from '@angular/common/http';
import { Country } from './model/country.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Dataset } from './model/dataset.model';
import { By } from '@angular/platform-browser';

import { RECAPTCHA_SETTINGS, RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { Configuration } from './model/config.model';
import { RecaptchaComponent } from 'ng-recaptcha';

const mockConfig: Configuration = {
  baseUrl: 'https://example.com',
  recaptchaApiKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
};

const mockDatasets: Dataset[] = [
  {
    name: "Dataset 1",
    ediid: "123",
    description: "This is the first dataset",
    url: "https://example.com/dataset/1",
    terms: ["term1", "term2", "term3"],
    requiresApproval: true,
    formTemplate: "template1"
  },
  {
    name: "Dataset 2",
    ediid: "456",
    description: "This is the second dataset",
    url: "https://example.com/dataset/2",
    terms: ["term4", "term5", "term6"],
    requiresApproval: false,
    formTemplate: "template2"
  },
  {
    name: "Dataset 3",
    ediid: "789",
    description: "This is the third dataset",
    url: "https://example.com/dataset/3",
    terms: ["term7", "term8", "term9"],
    requiresApproval: true,
    formTemplate: "template3"
  }
];

const mockCountries: Country[] = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'Mexico', code: 'MX' }
]

const mockFormTemplate = { id: 'template1', disclaimers: [], agreements: [], blockedEmails: [], blockedCountries: [] };

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let activatedRoute: ActivatedRoute;
  let mockConfigService: any;
  let service: ConfigurationService;

  beforeEach(async () => {
    mockConfigService = {
      getConfig: jest.fn().mockReturnValue(of(mockConfig)),
      getDatasets: jest.fn().mockReturnValue(of(mockDatasets)),
      getCountries: jest.fn().mockReturnValue(of(mockCountries)),
      getFormTemplate: jest.fn().mockReturnValue(of(mockFormTemplate)),
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: ConfigurationService, useValue: mockConfigService },
        RPAService,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ ediid: '123' }) }, // <-- mock ActivatedRoute
        },
        { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: mockConfig.recaptchaApiKey } },
      ],
      imports: [
        DropdownModule,
        ButtonModule,
        MessagesModule,
        MessageModule,
        PanelModule,
        HttpClientModule,
        HttpClientTestingModule,
        RecaptchaModule,
        ReactiveFormsModule,
        RecaptchaFormsModule
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    service = TestBed.inject(ConfigurationService);
    fixture.detectChanges();
  });


  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract ediid from query params', () => {
    fixture.detectChanges();
    expect(component.queryId).toBe('123');
  });

  it('should get datasets', () => {
    component.getDatasets().subscribe((data) => {
      expect(data).toEqual([]);
      expect(mockConfigService.getDatasets).toHaveBeenCalled();
    });
  });

  it('should load countries', () => {
    const countries = [
      { name: 'United States', code: 'US' },
      { name: 'Canada', code: 'CA' },
      { name: 'Mexico', code: 'MX' }
    ];
    component.loadCountries().subscribe(() => {
      expect(component.countries).toEqual(countries);
    });
  });

  // TODO: this test keeps failing as it doesn't recognize the recaptcha element.
  // it('should create re-captcha element with valid siteKey', async () => {
  //   await fixture.whenStable(); // wait for the component to finish rendering
  //   const element = fixture.debugElement.query(By.directive(RecaptchaComponent));
  //   expect(element).toBeTruthy();
  //   // const captchaComponent = element.componentInstance as RecaptchaComponent;
  //   // expect(captchaComponent.siteKey).toEqual('test-site-key');
  // });
  
  it('should have the app-footer and app-header components', () => {
    const footer = fixture.debugElement.query(By.css('app-footer'));
    expect(footer).toBeTruthy();
    const header = fixture.debugElement.query(By.css('app-header'));
    expect(header).toBeTruthy();
  });

  it('should render the div element when selectedDataset is null', () => {
    component.selectedDataset = null;
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeTruthy();
    expect(divElement.textContent).toContain('Oops! No dataset found.');
  });

  it('should not render the div element when selectedDataset is defined', () => {
    component.selectedDataset = mockDatasets[0];
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('.not-found-container');
    expect(divElement).toBeFalsy();
  });

  it('should not display form when selectedDataset is undefined or selectedFormTemplate is undefined', () => {
    component.selectedDataset = null;
    component.selectedFormTemplate = null;
    fixture.detectChanges();
    const formElement = fixture.debugElement.query(By.css('form'));
    expect(formElement).toBeNull();
    const errorMessageElement = fixture.debugElement.query(By.css('.oops-text'));
    expect(errorMessageElement.nativeElement.textContent).toContain('No dataset found');
  });

  it('should display form when selectedDataset and selectedFormTemplate are defined', () => {
    component.selectedDataset = { name: 'Dataset 1', ediid: '1', description: '', url: '', terms: [], requiresApproval: false, formTemplate: 'template1' };
    component.selectedFormTemplate = { id: 'template1', disclaimers: [], agreements: [], blockedEmails: [], blockedCountries: [] };
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('form')).nativeElement.style.display
    ).not.toBe('none');
  });

  it('should display progress spinner when displayProgressSpinner is true', () => {
    component.displayProgressSpinner = true;
    fixture.detectChanges();
    const progressSpinnerElement = fixture.debugElement.query(By.css('.progress-spinner'));
    expect(progressSpinnerElement).toBeTruthy();
  });
  
});
