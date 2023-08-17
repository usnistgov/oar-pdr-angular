import { TestBed } from '@angular/core/testing';
import { AppConfig } from './config-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ConfigServiceService', () => {
  let service: AppConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(AppConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
