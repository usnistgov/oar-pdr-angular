import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CollectionService', () => {
    let service: CollectionService;
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CollectionService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(CollectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
