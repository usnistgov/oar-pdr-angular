import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { APP_INITIALIZER } from '@angular/core';

import { Configuration, CONFIG_URL } from 'oarng';
import { LPSConfig } from './config.model';
import { AppConfig } from './config.service';

// import { environment } from '../../environments/environment';

describe('AppConfig', () => {
    let service: AppConfig;
    let httpMock: HttpTestingController;
    // Mock configuration object
    let mockConfig: Configuration = { };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: CONFIG_URL, useValue: "assets/config.json" },
                AppConfig
            ],
        });
        mockConfig = {
            links: {
                orgHome: "https://pdr.org/",
                portalBase: "https://data.pdr.org/"
            }
        };

        service = TestBed.inject(AppConfig);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        // This throws an error if there are any requests that haven't been flushed yet.
        httpMock.verify();
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

        expect(config).toBeTruthy();
        expect(service.get("links.orgHome")).toBe("https://pdr.org/");
        expect(service.get("links.portalBase")).toBe("https://data.pdr.org/");
        expect(service.get("links.pdrHome")).toBe("https://data.pdr.org/pdr/");
        expect(service.get("links.pdrIDResolver")).toBe("https://data.pdr.org/od/id/");
        expect(service.get("PDRAPIs.mdSearch")).toBe("https://data.pdr.org/rmm/");
        expect(service.get("PDRAPIs.mdService")).toBe("https://data.pdr.org/od/id/");
    });

});
