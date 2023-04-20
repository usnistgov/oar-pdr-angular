import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RPAService } from './rpa.service';
import { ConfigurationService } from './config.service';
import { RecordWrapper } from '../model/record.model';
import { Record } from '../model/record.model';
import { UserInfo } from '../model/record.model';
import { of } from 'rxjs';
import { Configuration } from '../model/config.model';
import { HttpClient } from '@angular/common/http';

describe('RPAService', () => {
    let service: RPAService;
    let httpMock: HttpTestingController;
    let configService: ConfigurationService;
    const expectedConfig: Configuration = {
        baseUrl: 'https://oardev.nist.gov/od/ds/rpa',
        recaptchaApiKey: 'my-api-key'
    };

    const REQUEST_ACCEPTED_PATH = "/request/accepted";
    const REQUEST_FORM_PATH = "/request/form";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RPAService, ConfigurationService]
        });
        service = TestBed.inject(RPAService);
        httpMock = TestBed.inject(HttpTestingController);
        configService = TestBed.inject(ConfigurationService);
        configService.loadConfig(expectedConfig);
        // Mock getConfig() method to return a dummy configuration
        jest.spyOn(configService, 'getConfig').mockReturnValue(expectedConfig);
        // Mock getConfigAsObservable() method to return an Observable of a dummy configuration
        jest.spyOn(ConfigurationService.prototype, 'getConfigAsObservable')
            .mockReturnValue(of(expectedConfig));

    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should have a baseUrl', () => {
        expect(service.baseUrl).toBeDefined();
        // expect(service.baseUrl).toBe('https://oardev.nist.gov/od/ds/rpa');
        expect(service.baseUrl).toBe('/');
    });

    it('should return the configuration as an observable', () => {
        expect(service.baseUrl).toBeDefined();
        // Create an isolated instance of RPAService
        service = new RPAService(TestBed.inject(HttpClient), configService);
        expect(service.baseUrl).toBe('https://oardev.nist.gov/od/ds/rpa');
    });

    it('should fetch record using HTTP GET request', () => {
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

        // Make HTTP GET request to fetch a record
        service.getRecord(mockRecordId).subscribe((recordWrapper: RecordWrapper) => {
            expect(recordWrapper).toEqual(mockRecordWrapper);
        });

        const request = httpMock.expectOne(`${service.baseUrl}${REQUEST_ACCEPTED_PATH}/${mockRecordId}`);
        expect(request.request.method).toBe('GET');
        request.flush(mockRecordWrapper);
    });


    it('should create a new record using HTTP POST request', () => {
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

        // Make HTTP POST request to create a new record
        service.createRecord(mockUserInfo, mockRecaptcha).subscribe((record: Record) => {
            expect(record).toEqual(mockRecord);
        });

        const request = httpMock.expectOne(`${service.baseUrl}${REQUEST_FORM_PATH}`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(JSON.stringify({ userInfo: mockUserInfo, recaptcha: mockRecaptcha }));
        request.flush(mockRecord);
    });

    // test HTTP error handling
    it('should handle HTTP errors', () => {
        const errorResponse = { status: 404, statusText: 'Not Found' };
        const recordId = '1';

        service.getRecord(recordId).subscribe(
            () => fail('should have failed with the 404 error'),
            (error) => {
                expect(error.status).toEqual(404);
                expect(error.statusText).toEqual('Not Found');
            }
        );

        const req = httpMock.expectOne(`${service.baseUrl}${REQUEST_ACCEPTED_PATH}/${recordId}`);
        expect(req.request.method).toBe('GET');

        req.flush(errorResponse);
    });

});
