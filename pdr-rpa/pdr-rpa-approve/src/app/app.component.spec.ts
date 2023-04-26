import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RPAService } from './service/rpa.service';
import { MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigurationService } from './service/config.service';
import { Configuration } from './model/config.model';
import { of } from 'rxjs';
import { ApprovalResponse, Record, RecordWrapper } from './model/record';
import { UnescapeHTMLPipe } from './pipe/unescape-html.pipe';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let rpaService: RPAService;

  const mockConfig: Configuration = {
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
      approvalStatus: 'Approved_2023-04-25T10:00:00.000Z',
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
        approvalStatus: 'Approved_2023-04-25T10:00:00.000Z'
      } as ApprovalResponse)),
      declineRequest: jest.fn().mockReturnValue(of({
        recordId: '123',
        approvalStatus: 'Declined_2023-04-25T10:00:00.000Z'
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
    fixture.detectChanges();
    expect(component.recordId).toBe('ark:123');
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
        approvalStatus: 'Approved_2023-04-25T10:00:00.000Z',
        productTitle: 'example title',
        subject: 'example subject',
        description: 'example description'
      }
    };

    expect(component.record).toBeTruthy();
    expect(component.status).toEqual('Approved_2023-04-25T10:00:00.000Z');
    expect(component.statusDate).toEqual('2023-04-25T10:00:00.000Z');
  });

  it('should call onApprove()', async () => {
    component.recordId = 'ark:123';
    component.onApprove();
    expect(component.displayProgressSpinner).toEqual(false);
    expect(mockRPAService.approveRequest).toHaveBeenCalledWith('ark:123');
  });

  it('should call onDecline()', () => {
    component.recordId = 'ark:123';
    component.onDecline();
    expect(component.displayProgressSpinner).toEqual(false);
    expect(mockRPAService.declineRequest).toHaveBeenCalledWith('ark:123');
  });

});

