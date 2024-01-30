import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { RPAService } from './rpa.service';
import { ConfigurationService } from './config.service';
import { RecordWrapper } from '../model/record.model';
import { Record } from '../model/record.model';
import { UserInfo } from '../model/record.model';
import { RPAConfiguration } from '../model/config.model';
import { environment } from '../../environments/environment';

describe('RPAService', () => {
    let service: RPAService;
    let httpMock: HttpTestingController;
    let configService: ConfigurationService;
    const expectedConfig: RPAConfiguration = {
        baseUrl: 'https://oardev.nist.gov/od/ds/rpa',
        recaptchaApiKey: 'my-api-key'
    };

    const REQUEST_ACCEPTED_PATH = "/request/accepted/";
    const REQUEST_FORM_PATH = "/request/form";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ConfigurationService,
                RPAService
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
        configService = TestBed.inject(ConfigurationService);
        configService.loadConfig(expectedConfig);
        // Mock getConfig() method to return a dummy configuration
        jest.spyOn(configService, 'getConfig').mockReturnValue(expectedConfig);
        // Assign the service instance to the variable declared at the top
        service = new RPAService(TestBed.inject(HttpClient), configService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should have the correct baseUrl', () => {
        expect(service.baseUrl).toBeDefined();
        expect(service.baseUrl).toBe('https://oardev.nist.gov/od/ds/rpa');
    });

    it('should fetch record using HTTP GET request', async () => {
        const mockRecordId = '123';
        const mockRecordWrapper: RecordWrapper = {
            record: {
                id: '123',
                caseNum: '12345',
                userInfo: {
                    fullName: 'John Doe',
                    organization: 'NIST',
                    email: 'john.doe@nist.gov',
                    receiveEmails: 'yes',
                    country: 'United States',
                    approvalStatus: 'pending',
                    productTitle: 'Some Title',
                    subject: 'Some Subject',
                    description: 'Some Description',
                    recaptcha: 'recaptcha-token'
                }
            }
        };

        let getRecordPromise = service.getRecord(mockRecordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${mockRecordId}`;
        const request = httpMock.expectOne(url);
        expect(request.request.method).toBe('GET');
        request.flush(mockRecordWrapper);

        // Make HTTP GET request to fetch a record
        const recordWrapper = await getRecordPromise;

        expect(recordWrapper).toEqual(mockRecordWrapper);
    });


    it('should create a new record using HTTP POST request', async () => {
        const mockUserInfo: UserInfo = {
            fullName: 'John Doe',
            organization: 'NIST',
            email: 'john.doe@nist.gov',
            receiveEmails: 'yes',
            country: 'United States',
            approvalStatus: 'pending',
            productTitle: 'Some Title',
            subject: 'Some Subject',
            description: 'Some Description',
            recaptcha: 'recaptcha-token'
        };

        const mockRecaptcha = 'example-recaptcha';
        const mockRecord: Record = {
            id: '123',
            caseNum: '12345',
            userInfo: mockUserInfo
        };

        let createRecordPromise = service.createRecord(mockUserInfo, mockRecaptcha).toPromise();

        const url = `${service.baseUrl}${REQUEST_FORM_PATH}`;
        const request = httpMock.expectOne(url);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(JSON.stringify({ userInfo: mockUserInfo, recaptcha: mockRecaptcha }));
        request.flush(mockRecord);

        const record = await createRecordPromise;
        expect(record).toEqual(mockRecord);
    });

    // test HTTP error handling
    it('should handle HTTP errors when getRecord() fails', async () => {
        const recordId = '1';
        
        let getRecordPromise = service.getRecord(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('GET');
        
    
        const errorMessage = "Http failure response for https://oardev.nist.gov/od/ds/rpa/request/accepted/1: 404 Not Found"
        
        const errorResponse = { 
            error: new ErrorEvent('Network error', { message: errorMessage }),
            status: 404, 
            statusText: 'Not Found' 
        };
        
        req.flush(errorResponse.error.message, errorResponse);

        // Mock the second retry
        httpMock.expectOne(url).flush(errorResponse.error.message, errorResponse);

        try {
            await getRecordPromise;
            fail('Expected promise to be rejected and error to be thrown');
        } catch (error) {
            expect(error.code).toBe('SERVER_ERROR_404');
            expect(error.message).toBe(errorMessage);
        }
    });

});
