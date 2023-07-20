import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { RPAService } from './rpa.service';
import {
    ConfigModule, ConfigurationService, CONFIG_URL, RELEASE_INFO, Credentials
} from 'oarng';
import { ApprovalResponse, RecordWrapper } from '../model/record';
import { RELEASE } from '../../environments/release-info';
import { environment } from '../../environments/environment';

describe('RPAService', () => {
    let service: RPAService;
    let httpMock: HttpTestingController;
    let configService: ConfigurationService;
    const REQUEST_ACCEPTED_PATH = "/request/accepted/";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            providers: [
//                { provide: RELEASE_INFO, useValue: RELEASE },
                { provide: CONFIG_URL, useValue: environment.configUrl },
                ConfigurationService,
                RPAService
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
        configService = TestBed.inject(ConfigurationService);
        service = TestBed.inject(RPAService);

        // mock getConfig() method to return a dummy configuration
        jest.spyOn(configService, 'getConfig').mockReturnValue({ baseUrl: 'https://oardev.nist.gov/od/ds/rpa' });
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('getHttpOptions', () => {
        let opts = service.getHttpOptions();
        expect(opts.headers instanceof HttpHeaders).toBeTruthy();
        expect(opts.headers.get("Content-Type")).toEqual("application/json");
        expect(opts.headers.get("Authorization")).toBeNull();

        let creds: Credentials = {
            userId: "jqp1",
            userAttributes: {},
            token: "goob"
        };
        opts = service.getHttpOptions(creds);
        expect(opts.headers instanceof HttpHeaders).toBeTruthy();
        expect(opts.headers.get("Content-Type")).toEqual("application/json");
        expect(opts.headers.get("Authorization")).toEqual("Bearer goob");
    });

    it('should be created', () => {
        expect(configService).toBeTruthy();
        expect(service).toBeTruthy();
        expect(service.baseUrl).toBe("https://oardev.nist.gov/od/ds/rpa")
    });

    it('should get a record by ID', async () => {
        const recordId = '1234';
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
                    description: 'Some Description'
                }
            }
        };
        let getRecordPromise = service.getRecord(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const request = httpMock.expectOne(url);
        expect(request.request.method).toBe('GET');
        request.flush(mockRecordWrapper);

        // Make HTTP GET request to fetch a record
        const recordWrapper = await getRecordPromise;

        expect(recordWrapper).toEqual(mockRecordWrapper);
    });

    // test HTTP error handling
    it('should handle HTTP errors when getRecord() fails', async () => {
        const recordId = '123';

        let getRecordPromise = service.getRecord(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('GET');

        const errorResponse = { status: 404, statusText: 'Not Found' };
        const errorMessage = "Http failure response for https://oardev.nist.gov/od/ds/rpa/request/accepted/123: 404 Not Found";
        req.flush(errorMessage, errorResponse);

        // Mock the second retry
        httpMock.expectOne(url).flush(errorMessage, errorResponse);

        try {
            await getRecordPromise;
            fail('Expected promise to be rejected and error to be thrown');
        } catch (error) {
            expect(error.code).toBe("SERVER_ERROR_404");
            expect(error.message).toBe(errorMessage);
        }
    });

    it('should call PATCH method with correct parameters', async () => {
        const recordId = '123';
        const expectedResponse: ApprovalResponse = { "recordId": recordId, approvalStatus: 'Approved_2023-05-08 3:14 PM' };

        const promise = service.approveRequest(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const request = httpMock.expectOne(url);
        expect(request.request.method).toBe('PATCH');
        request.flush(expectedResponse);

        const response = await promise;

        expect(response).toEqual(expectedResponse);
    });

    it('should handle HTTP errors when approveRequest() fails', async () => {
        const recordId = '123';

        let promise = service.approveRequest(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('PATCH');

        const errorResponse = { status: 500, statusText: 'Internal Server Error' };
        const errorMessage = "Http failure response for https://oardev.nist.gov/od/ds/rpa/request/accepted/123: 500 Internal Server Error";
        req.flush(errorMessage, errorResponse);

        try {
            await promise;
            fail('Expected promise to be rejected and error to be thrown');
        } catch (error) {
            expect(error.code).toBe("SERVER_ERROR_500");
            expect(error.message).toBe(errorMessage);
        }
    });

    it('should call PATCH method with correct parameters', async () => {
        const recordId = '123';
        const expectedResponse: ApprovalResponse = { "recordId": recordId, approvalStatus: 'Declined_2023-05-08 3:14 PM' };

        const promise = service.declineRequest(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const request = httpMock.expectOne(url);
        expect(request.request.method).toBe('PATCH');
        request.flush(expectedResponse);

        const response = await promise;

        expect(response).toEqual(expectedResponse);
    });

    it('should handle HTTP errors when declineRequest() fails', async () => {
        const recordId = '123';

        let promise = service.declineRequest(recordId).toPromise();

        const url = `${service.baseUrl}${REQUEST_ACCEPTED_PATH}${recordId}`;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('PATCH');

        const errorResponse = { status: 500, statusText: 'Internal Server Error' };
        const errorMessage = "Http failure response for https://oardev.nist.gov/od/ds/rpa/request/accepted/123: 500 Internal Server Error";
        req.flush(errorMessage, errorResponse);

        try {
            await promise;
            fail('Expected promise to be rejected and error to be thrown');
        } catch (error) {
            expect(error.code).toBe("SERVER_ERROR_500");
            expect(error.message).toBe(errorMessage);
        }
    });

});
