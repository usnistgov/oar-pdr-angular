import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { APP_INITIALIZER } from '@angular/core';

import { ConfigurationService } from './config.service';
import { Dataset } from '../model/dataset.model';
import { Country } from '../model/country.model';
import { RPAConfiguration } from '../model/config.model';
import { FormTemplate } from '../model/form-template.model';
import { ServiceModule } from "./service.module";

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let httpMock: HttpTestingController;
    // Mock configuration object
    const mockConfig: RPAConfiguration = {
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
     * 
     * Note: we use the the promise which is cleaner and simpler.
     */
    it('should fetch configuration', async () => {
        // The purpose of the timeout is to allow the fetchConfig() method to be called,
        // and for the HTTP request to be made, before the mock response is provided.
        // Without this timeout, the mock response might be sent before the HTTP request is made, 
        // which will result in an assertion error.
        setTimeout(() => {
            // Set up the http mock to return the mock response
            const req = httpMock.expectOne('assets/config.json');
            // Checks the request method used to see if it was a GET.
            expect(req.request.method).toBe('GET');
            // This provides mock configuration data as a response to the HTTP request.
            // This is what triggers the test's subscription to receive the mock configuration data.
            // It also closes the 
            req.flush(mockConfig);
        });

        // Use async/await syntax to wait for the fetchConfig() method to complete its asynchronous operation
        const config = await service.fetchConfig().toPromise();
        // Assert
        expect(config).toEqual(mockConfig);
    });

    it('should fetch configuration v2 (with promise)', async () => {
        // Create a promise. This will pause the test until the promise is resolved using await.
        const configPromise = service.fetchConfig().toPromise();
        // By the time the HTTP request is expected, the configPromise has already been created.
        const req = httpMock.expectOne('assets/config.json');
        expect(req.request.method).toBe('GET');
        // Set the HTTP response
        req.flush(mockConfig);

        // Wait for fetchConfig() to finish, which will hang on HttpClient.get() to finish
        const config = await configPromise;

        // Assert
        expect(config).toEqual(mockConfig);
        // Additional check using config getter
        expect(service.getConfig()).toEqual(mockConfig);
    });


    // getConfig() returns a default configuration object when config is null.
    it('should return default configuration when config is null', () => {
        service.config = null;
        expect(service.getConfig()).toEqual({ });
    });

    it('should return configuration object', () => {
        service.config = mockConfig;
        const actualConfig = service.getConfig();
        expect(actualConfig).toBeDefined();
        expect(actualConfig.baseUrl).toEqual(mockConfig.baseUrl);
        expect(actualConfig.recaptchaApiKey).toEqual(mockConfig.recaptchaApiKey);
    });


    // getDatasets() returns the correct data.
    it('should return the list of datasets', async () => {
        const mockResponse = `
          datasets:
            - name: dataset1
              ediid: '1'
              description: description1
              url: url1
              terms:
                - term1
                - term2
              requiresApproval: true
              formTemplate: formTemplate1
            - name: dataset2
              ediid: '2'
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

        const getDatasetsPromise = service.getDatasets().toPromise();

        const req = httpMock.expectOne('assets/datasets.yaml');
        expect(req.request.method).toEqual('GET');
        req.flush(mockResponse);

        const datasets = await getDatasetsPromise;

        expect(datasets).toEqual(expectedDatasets);
    });

    // getFormTemplate() returns the correct form template.
    it('should return the form template with the specified name', async () => {
        const formName = 'demo';
        const formTemplate: FormTemplate = {
            id: formName,
            disclaimers: ['some disclaimer here.'],
            agreements: [
                'term 1.',
                'term 2.',
                'term 3.'
            ],
            blockedEmails: [],
            blockedCountries: []
        };

        const mockResponse = `
        formTemplates:
        - id: demo
          disclaimers: 
            - some disclaimer here.
          agreements: 
            - term 1.
            - term 2.
            - term 3.
          blockedEmails: []
          blockedCountries: []
        - id: no-disclaimer
          disclaimers: 
          agreements: 
            - term 1.
            - term 2.
          blockedEmails:
            - email 1
            - email 2
          blockedCountries:
            - Country 1
            - Country 2
        `;

        const getFormTemplatePromise = service.getFormTemplate(formName).toPromise();

        const req = httpMock.expectOne('assets/datasets.yaml');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        const formTemplateResponse = await getFormTemplatePromise;
        expect(formTemplateResponse).toEqual(formTemplate);
    });

    // getCountries() returns the correct data.
    it('should get countries', async () => {
        const mockCountries: Country[] = [
            { name: 'United States', code: 'US' },
            { name: 'Canada', code: 'CA' },
            { name: 'Mexico', code: 'MX' }
        ];

        const getCountriesPromise = service.getCountries().toPromise();

        const req = httpMock.expectOne('assets/countries.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockCountries);

        const countries = await getCountriesPromise;

        expect(countries).toEqual(mockCountries);
    });

    // getCountries() returns error if invalid url
    it('should throw an error for invalid countries URL', async () => {
        const invalidUrl = 'invalid-url';
        const errorMessage = `Error Code: 404\nMessage: Http failure response for ${invalidUrl}: 404 Not Found`;

        const getCountriesPromise = service.getCountries(invalidUrl).toPromise();

        const req = httpMock.expectOne(invalidUrl);
        expect(req.request.method).toBe('GET');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });

        try {
            await getCountriesPromise;
            fail('Expected promise to be rejected and error to be thrown');
        } catch (error) {
            expect(error).toBe(errorMessage);
        }
    });

});

describe('ConfgirationService via ServiceModule', () => {
    let svc: ConfigurationService;
    let initToken: any;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ServiceModule]
        });

        svc = TestBed.inject(ConfigurationService);
        httpMock = TestBed.inject(HttpTestingController);

        let req = httpMock.expectOne('assets/config.json');
        req.flush({
            baseUrl: "http://localhost:4201/",
            recaptchaApiKey: "X"
        });

        initToken = TestBed.inject(APP_INITIALIZER);
        // await initToken;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('fetches config data', () => {
        let config: RPAConfiguration = svc.getConfig() as RPAConfiguration;
        expect(config.baseUrl).toBe("http://localhost:4201/");
        expect(config.recaptchaApiKey).toBeTruthy();
    });

});

