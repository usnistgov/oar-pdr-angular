import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationService } from './config.service';
import { Dataset } from '../model/dataset.model';
import { Country } from '../model/country.model';
import { Configuration } from '../model/config.model';

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let httpMock: HttpTestingController;
    // Mock configuration object
    const mockConfig: Configuration = {
        baseUrl: 'https://oardev.nist.gov/od/ds/rpa',
        recaptchaApiKey: 'my-api-key'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConfigurationService],
        });

        service = TestBed.inject(ConfigurationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        // This throws an error if there are any requests that haven't been flushed yet.
        httpMock.verify();
    });

    /**
     * Unit test for the fetchConfig() from the ConfigurationService. 
     * The fetchConfig() method makes an HTTP GET request to retrieve configuration data from the server.
     */
    it('should fetch configuration', () => {
        // Subscribe to fetchConfig()
        service.fetchConfig().subscribe((config) => {
            // Expect the received configuration to match the mockConfig data
            expect(config).toEqual(mockConfig);
        });

        // Expect fetchConfig() to make an HTTP GET request to 'assets/config.json'.
        const req = httpMock.expectOne('assets/config.json');
        // Checks the request method used to see if it was a GET.
        expect(req.request.method).toBe('GET');
        // This provides mock configuration data as a response to the HTTP request.
        // This is what triggers the test's subscription to receive the mock configuration data.
        // It also closes the 
        req.flush(mockConfig);
    });

    // getConfig() returns a default configuration object when config is null.
    it('should return default configuration when config is null', () => {
        service.config = null;
        expect(service.getConfig()).toEqual({ baseUrl: "/", recaptchaApiKey: "" });
    });

    // getDatasets() returns the correct data.
    it('should return the list of datasets', () => {
        const mockResponse = `
          datasets:
            - name: dataset1
              ediid: 1
              description: description1
              url: url1
              terms:
                - term1
                - term2
              requiresApproval: true
              formTemplate: formTemplate1
            - name: dataset2
              ediid: 2
              description: description2
              url: url2
              terms:
                - term3
                - term4
              requiresApproval: false
              formTemplate: formTemplate2`;

        const expectedDatasets: Dataset[] = [
            {
                name: 'dataset1',
                ediid: '1',
                description: 'description1',
                url: 'url1',
                terms: ['term1', 'term2'],
                requiresApproval: true,
                formTemplate: 'formTemplate1'
            },
            {
                name: 'dataset2',
                ediid: '2',
                description: 'description2',
                url: 'url2',
                terms: ['term3', 'term4'],
                requiresApproval: false,
                formTemplate: 'formTemplate2'
            }
        ];

        service.getDatasets().subscribe((datasets: Dataset[]) => {
            expect(datasets).toEqual(expectedDatasets);
        });

        const req = httpMock.expectOne('assets/datasets.yaml');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    // getFormTemplate() returns the correct form template.
    it('should return the form template with the specified name', () => {
        const mockFormTemplates = {
            formTemplates: [
                {
                    id: 'template1',
                    disclaimers: ['disclaimer1'],
                    agreements: ['agreement1'],
                    blockedEmails: ['blockedEmail1'],
                    blockedCountries: ['blockedCountry1']
                },
                {
                    id: 'template2',
                    disclaimers: ['disclaimer2'],
                    agreements: ['agreement2'],
                    blockedEmails: ['blockedEmail2'],
                    blockedCountries: ['blockedCountry2']
                }
            ]
        };

        const formTemplateName = 'template1';
        const mockMatchingTemplate = mockFormTemplates.formTemplates[0];

        service.getFormTemplate(formTemplateName).subscribe((formTemplate) => {
            expect(formTemplate).toEqual(mockMatchingTemplate);
        });

        const req = httpMock.expectOne('assets/datasets.yaml');
        expect(req.request.method).toBe('GET');
        req.flush({ formTemplates: mockFormTemplates });
    });

    // getCountries() returns the correct data.
    it('should get countries', () => {
        const mockCountries: Country[] = [
            { name: 'United States', code: 'US' },
            { name: 'Canada', code: 'CA' },
            { name: 'Mexico', code: 'MX' }
        ];

        service.getCountries().subscribe((countries) => {
            expect(countries).toEqual(mockCountries);
        });

        const req = httpMock.expectOne('assets/countries.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockCountries);
    });

    // getCountries() returns error if invalid url
    it('should throw an error for invalid countries URL', () => {
        const invalidUrl = 'invalid-url';
        const errorMessage = `Error Code: 404\nMessage: Http failure response for ${invalidUrl}: 404 Not Found`;
      
        service.getCountries(invalidUrl).subscribe({
          error: (err) => {
            expect(err.message).toBe(errorMessage);
          }
        });
      
        const req = httpMock.expectOne(invalidUrl);
        expect(req.request.method).toBe('GET');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });
      
});
