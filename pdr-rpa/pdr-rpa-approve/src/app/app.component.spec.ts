import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent, RecordDescription } from './app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RPAService } from './service/rpa.service';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService, AuthenticationService, MockAuthenticationService } from 'oarng';
import { RPAConfiguration } from './model/config.model';
import { of } from 'rxjs';
import { ApprovalResponse, Record, RecordWrapper } from './model/record';
import { UnescapeHTMLPipe } from './pipe/unescape-html.pipe';

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
          useValue: { queryParams: of({ id: 'ark:123' }) }, // <-- mock ActivatedRoute
        },
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: RPAService, useValue: mockRPAService },
        MessageService,
      ],
      imports: [HttpClientTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    const record: Record = {
      id: '',
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
});

