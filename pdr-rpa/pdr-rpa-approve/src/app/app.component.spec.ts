import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent, RecordDescription } from './app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RPAService } from './service/rpa.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService, AuthenticationService, MockAuthenticationService } from 'oarng';
import { RPAConfiguration } from './model/config.model';
import { of } from 'rxjs';
import { ApprovalResponse, Record, RecordWrapper } from './model/record';
import { UnescapeHTMLPipe } from './pipe/unescape-html.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock environment to disable simulation in tests
jest.mock('../environments/environment', () => ({
  environment: {
    production: false,
    configUrl: 'assets/config.json',
    debug: false,
    simulateData: false  // Disable simulation in tests
  }
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let rpaService: RPAService;

  const mockConfig: RPAConfiguration = {
    baseUrl: 'https://example.com',
  };

  const mockRecord: Record = {
    id: '123',
    caseNum: '1234567890',
    userInfo: {
      fullName: 'John Doe',
      organization: 'NIST',
      email: 'john.doe@nist.gob',
      receiveEmails: 'Yes',
      country: 'United States',
      approvalStatus: 'Approved_2023-04-25T10:00:00.000Z_sme@nist.gov',
      productTitle: 'example title',
      subject: 'example subject',
      description: 'example description'
    }
  };

  let mockConfigService: any;
  let mockRPAService: any;

  beforeEach(async () => {
    mockConfigService = {
      getConfig: jest.fn().mockReturnValue(mockConfig),
    };
    mockRPAService = {
      getRecord: jest.fn().mockReturnValue(of({ "record": mockRecord } as RecordWrapper)),
      approveRequest: jest.fn().mockReturnValue(of({
        recordId: '123',
        approvalStatus: 'Approved_2023-04-25T10:00:00.000Z_sme@nist.gov'
      } as ApprovalResponse)),
      declineRequest: jest.fn().mockReturnValue(of({
        recordId: '123',
        approvalStatus: 'Declined_2023-04-25T10:00:00.000Z_sme@nist.gov'
      } as ApprovalResponse))
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent, UnescapeHTMLPipe],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ id: 'ark:123' }) },
        },
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: RPAService, useValue: mockRPAService },
      ],
      imports: [HttpClientTestingModule, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('darkMode');
    document.body.classList.remove('dark-mode');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract recordId from query params', () => {
    component.ngOnInit();
    expect(component.recordId).toBe('ark:123');
  });

  it('should extract user credentials', () => {
    component.ngOnInit();
    expect(component._creds!.userId).toBe('anon');
    expect(component._creds!.userAttributes.userLastName).toBe('Public');
    expect(component._creds!.token).toBe('fake jwt token');
  });

  it('should fetch the record and set the status', async () => {
    expect(component.record).toBeTruthy();
    expect(component.status).toEqual('Approved');
    expect(component.statusDate).toEqual('2023-04-25T10:00:00.000Z');
    expect(component.smeEmail).toEqual('sme@nist.gov');
  });

  it('should call onApprove()', async () => {
    component.recordId = 'ark:123';
    component.onApprove();
    expect(component.displayProgressSpinner).toEqual(true);
    expect(mockRPAService.approveRequest).toHaveBeenCalledWith(
      'ark:123',
      {
        "token": "fake jwt token",
        "userAttributes": { "userLastName": "Public", "userName": "John" },
        "userId": "anon"
      }
    );
  });

  it('should call onDecline()', () => {
    component.recordId = 'ark:123';
    component.onDecline();
    expect(component.displayProgressSpinner).toEqual(true);
    expect(mockRPAService.declineRequest).toHaveBeenCalledWith(
      'ark:123',
      {
        "token": "fake jwt token",
        "userAttributes": { "userLastName": "Public", "userName": "John" },
        "userId": "anon"
      }
    );
  });

  describe('dark mode', () => {
    it('should initialize dark mode from localStorage', () => {
      localStorage.setItem('darkMode', 'true');
      component.initDarkMode();
      expect(component.isDarkMode).toBe(true);
      expect(document.body.classList.contains('dark-mode')).toBe(true);
    });

    it('should toggle dark mode', () => {
      expect(component.isDarkMode).toBe(false);
      component.toggleDarkMode();
      expect(component.isDarkMode).toBe(true);
      expect(document.body.classList.contains('dark-mode')).toBe(true);
      expect(localStorage.getItem('darkMode')).toBe('true');
    });
  });

  describe('toast notifications', () => {
    it('should show toast with correct message and type', () => {
      component.showToast('Test message', 'success');
      expect(component.toastVisible).toBe(true);
      expect(component.toastMessage).toBe('Test message');
      expect(component.toastType).toBe('success');
    });

    it('should hide toast', () => {
      component.showToast('Test', 'info');
      expect(component.toastVisible).toBe(true);
      component.hideToast();
      expect(component.toastVisible).toBe(false);
    });

    it('should show error toast', () => {
      component.showToast('Error occurred', 'error');
      expect(component.toastVisible).toBe(true);
      expect(component.toastType).toBe('error');
    });
  });

  describe('error state', () => {
    it('should have error properties initialized', () => {
      expect(component.errorTitle).toBe('');
      expect(component.errorMessage).toBe('');
      expect(component.recordNotFound).toBe(false);
    });

    it('should set error state correctly', () => {
      component.errorTitle = 'Test Error';
      component.errorMessage = 'Something went wrong';
      component.recordNotFound = true;

      expect(component.errorTitle).toBe('Test Error');
      expect(component.errorMessage).toBe('Something went wrong');
      expect(component.recordNotFound).toBe(true);
    });
  });

  describe('refreshPage', () => {
    it('should call window.location.reload', () => {
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true
      });

      component.refreshPage();
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('parseDescription', () => {
    it('should extract fields from a valid description string', () => {
      const description = 'Product Title: NIST Fingerprint Image Quality (NFIQ) 2 Conformance Test Set\n\n' +
        'Phone Number: 123-456-7890\n\n' +
        'Address:\n100 Bureau Drive\nGaithersburg, MD, 20899';
      const expected: RecordDescription = {
        title: 'NIST Fingerprint Image Quality (NFIQ) 2 Conformance Test Set',
        phone: '123-456-7890',
        address: '100 Bureau Drive, Gaithersburg, MD, 20899',
      };
      component.parseDescription(description);
      expect(component.recordDescription).toEqual(expected);

    });

    it('should return empty fields for an invalid description string', () => {
      const description = 'This is not a valid description';
      const expected: RecordDescription = {
        title: '',
        phone: '',
        address: '',
      };
      component.parseDescription(description);
      expect(component.recordDescription).toEqual(expected);

    });
  });

  describe('parseApprovalStatus', () => {

    const pendingMockRecord: Record = {
      id: '123',
      caseNum: '1234567890',
      userInfo: {
        fullName: 'John Doe',
        organization: 'NIST',
        email: 'john.doe@nist.gov',
        receiveEmails: 'Yes',
        country: 'United States',
        approvalStatus: 'Pending',
        productTitle: 'example title',
        subject: 'example subject',
        description: 'example description'
      }
    };

    const approvedMockRecord: Record = {
      id: '123',
      caseNum: '1234567890',
      userInfo: {
        fullName: 'John Doe',
        organization: 'NIST',
        email: 'john.doe@nist.gov',
        receiveEmails: 'Yes',
        country: 'United States',
        approvalStatus: 'Approved_2023-04-25T10:00:00.000Z_sme@nist.gov_randomId12345',
        productTitle: 'example title',
        subject: 'example subject',
        description: 'example description'
      }
    };

    it('should correctly parse a pending status', () => {
      component.parseApprovalStatus(pendingMockRecord);
      expect(component.status).toEqual('Pending');
      expect(component.statusDate).toEqual('');
      expect(component.smeEmail).toEqual('');
      expect(component.randomId).toEqual('');
    });

    it('should correctly parse a 4-part status', () => {
      component.parseApprovalStatus(approvedMockRecord);
      expect(component.status).toEqual('Approved');
      expect(component.statusDate).toEqual('2023-04-25T10:00:00.000Z');
      expect(component.smeEmail).toEqual('sme@nist.gov');
      expect(component.randomId).toEqual('randomId12345');
    });
  });
});
