import { TestBed } from '@angular/core/testing';
import { WizardService } from './wizard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WizardService', () => {
  let service: WizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule]
    });
    service = TestBed.inject(WizardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
