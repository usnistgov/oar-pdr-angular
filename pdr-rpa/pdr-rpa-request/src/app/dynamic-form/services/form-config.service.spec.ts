import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormConfigService } from './form-config.service';
import { AppFormConfig } from '../models';

describe('FormConfigService', () => {
  let service: FormConfigService;
  let httpMock: HttpTestingController;

  const mockYamlConfig = `
forms:
  - id: rpa-request
    title: Access Request Form
    sections:
      - id: contact
        title: Contact Info
        fields:
          - id: fullName
            type: text
            label: Full Name
            required: true
          - id: email
            type: email
            label: Email
            required: true

datasets:
  - id: "ark:/88434/mds2-2909"
    name: Test Dataset
    description: A test dataset
    url: https://example.com
    terms:
      - Term 1
      - Term 2
    agreements:
      - Agreement 1
    requiresApproval: true
    blockedEmails:
      - "@gmail\\\\."
    blockedCountries:
      - Cuba

settings:
  countriesUrl: assets/countries.json
  recaptchaSiteKey: test-site-key
`;

  const expectedConfig: AppFormConfig = {
    forms: [{
      id: 'rpa-request',
      title: 'Access Request Form',
      sections: [{
        id: 'contact',
        title: 'Contact Info',
        fields: [
          { id: 'fullName', type: 'text', label: 'Full Name', required: true },
          { id: 'email', type: 'email', label: 'Email', required: true }
        ]
      }]
    }],
    datasets: [{
      id: 'ark:/88434/mds2-2909',
      name: 'Test Dataset',
      description: 'A test dataset',
      url: 'https://example.com',
      terms: ['Term 1', 'Term 2'],
      agreements: ['Agreement 1'],
      requiresApproval: true,
      blockedEmails: ['@gmail\\.'],
      blockedCountries: ['Cuba']
    }],
    settings: {
      countriesUrl: 'assets/countries.json',
      recaptchaSiteKey: 'test-site-key'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FormConfigService]
    });

    service = TestBed.inject(FormConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadConfig', () => {
    it('should load and parse YAML config', async () => {
      const configPromise = service.loadConfig().toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      expect(req.request.method).toBe('GET');
      req.flush(mockYamlConfig);

      const config = await configPromise;
      expect(config).toBeDefined();
      expect(config?.forms.length).toBe(1);
      expect(config?.datasets.length).toBe(1);
    });

    it('should cache config after first load', async () => {
      // First call
      const promise1 = service.loadConfig().toPromise();
      const req1 = httpMock.expectOne('assets/form-config.yaml');
      req1.flush(mockYamlConfig);
      await promise1;

      // Second call should use cache (no HTTP request)
      const promise2 = service.loadConfig().toPromise();
      httpMock.expectNone('assets/form-config.yaml');
      await promise2;
    });

    it('should throw error for invalid config', (done) => {
      const invalidYaml = `
forms: "not an array"
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for missing datasets', (done) => {
      const invalidYaml = `
forms: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for form without id', (done) => {
      const invalidYaml = `
forms:
  - title: Missing ID
    sections: []
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for form without sections', (done) => {
      const invalidYaml = `
forms:
  - id: test
    title: Test
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for section without id', (done) => {
      const invalidYaml = `
forms:
  - id: test
    title: Test
    sections:
      - title: Missing ID
        fields: []
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for field without id', (done) => {
      const invalidYaml = `
forms:
  - id: test
    title: Test
    sections:
      - id: section1
        fields:
          - type: text
            label: Missing ID
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for field without type', (done) => {
      const invalidYaml = `
forms:
  - id: test
    title: Test
    sections:
      - id: section1
        fields:
          - id: field1
            label: Missing Type
datasets: []
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for dataset without id', (done) => {
      const invalidYaml = `
forms: []
datasets:
  - name: Missing ID
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });

    it('should throw error for dataset without name', (done) => {
      const invalidYaml = `
forms: []
datasets:
  - id: test-dataset
`;

      service.loadConfig().subscribe({
        next: () => {
          done.fail('Expected error to be thrown');
        },
        error: (err) => {
          expect(err.message).toContain('Failed to load form configuration');
          done();
        }
      });

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(invalidYaml);
    });
  });

  describe('getForm', () => {
    it('should return form by ID', async () => {
      const formPromise = service.getForm('rpa-request').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const form = await formPromise;
      expect(form?.id).toBe('rpa-request');
      expect(form?.title).toBe('Access Request Form');
    });

    it('should return undefined for unknown form ID', async () => {
      const formPromise = service.getForm('unknown-form').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const form = await formPromise;
      expect(form).toBeUndefined();
    });
  });

  describe('getForms', () => {
    it('should return all forms', async () => {
      const formsPromise = service.getForms().toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const forms = await formsPromise;
      expect(forms?.length).toBe(1);
      expect(forms?.[0].id).toBe('rpa-request');
    });
  });

  describe('getDataset', () => {
    it('should return dataset by ID', async () => {
      const datasetPromise = service.getDataset('ark:/88434/mds2-2909').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const dataset = await datasetPromise;
      expect(dataset?.id).toBe('ark:/88434/mds2-2909');
      expect(dataset?.name).toBe('Test Dataset');
    });

    it('should return undefined for unknown dataset ID', async () => {
      const datasetPromise = service.getDataset('unknown-dataset').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const dataset = await datasetPromise;
      expect(dataset).toBeUndefined();
    });
  });

  describe('getDatasets', () => {
    it('should return all datasets', async () => {
      const datasetsPromise = service.getDatasets().toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const datasets = await datasetsPromise;
      expect(datasets?.length).toBe(1);
      expect(datasets?.[0].id).toBe('ark:/88434/mds2-2909');
    });
  });

  describe('getSettings', () => {
    it('should return settings', async () => {
      const settingsPromise = service.getSettings().toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const settings = await settingsPromise;
      expect(settings?.countriesUrl).toBe('assets/countries.json');
      expect(settings?.recaptchaSiteKey).toBe('test-site-key');
    });
  });

  describe('getFormForDataset', () => {
    it('should return form and dataset together', async () => {
      const resultPromise = service.getFormForDataset('rpa-request', 'ark:/88434/mds2-2909').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result?.form.id).toBe('rpa-request');
      expect(result?.dataset.id).toBe('ark:/88434/mds2-2909');
    });

    it('should return null for unknown form', async () => {
      const resultPromise = service.getFormForDataset('unknown', 'ark:/88434/mds2-2909').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const result = await resultPromise;
      expect(result).toBeNull();
    });

    it('should return null for unknown dataset', async () => {
      const resultPromise = service.getFormForDataset('rpa-request', 'unknown').toPromise();

      const req = httpMock.expectOne('assets/form-config.yaml');
      req.flush(mockYamlConfig);

      const result = await resultPromise;
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear config cache', async () => {
      // First load
      const promise1 = service.loadConfig().toPromise();
      const req1 = httpMock.expectOne('assets/form-config.yaml');
      req1.flush(mockYamlConfig);
      await promise1;

      // Clear cache
      service.clearCache();

      // Second load should make a new request
      const promise2 = service.loadConfig().toPromise();
      const req2 = httpMock.expectOne('assets/form-config.yaml');
      req2.flush(mockYamlConfig);
      await promise2;
    });
  });
});
