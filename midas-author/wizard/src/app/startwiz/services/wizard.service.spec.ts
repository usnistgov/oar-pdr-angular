import { TestBed, waitForAsync } from '@angular/core/testing';
import { WizardService } from './wizard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from 'oarng';
import { LPSConfig } from 'oarlps';
import { config, environment } from '../../../environments/environment';

describe('WizardService', () => {
  let service: WizardService;
  let cfgsvc: ConfigurationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule ]
    });
    cfgsvc = TestBed.inject(ConfigurationService);
    cfgsvc.loadConfig(config);
    service = TestBed.inject(WizardService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.MIDASAPI).toBe("/midas/dap/def/");
  });
});
