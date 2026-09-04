import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { ElementRef, ChangeDetectorRef, NO_ERRORS_SCHEMA } from "@angular/core";
import { GlobalService } from '../../../shared/globals/globals';
import { SubmitConfirmComponent } from './submit-confirm.component';
import { MetadataUpdateService } from '../../../landing/editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { of } from 'rxjs';
import { StaffDirectoryService, StaffDirModule, AuthenticationService } from 'oarng';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('SubmitConfirmComponent', () => {
    let component: SubmitConfirmComponent;
    let fixture: ComponentFixture<SubmitConfirmComponent>;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
    let ps: StaffDirectoryService;
    let authsvc: AuthenticationService;
    let httpMock: HttpTestingController;
    let svcep : string = "https://mds.nist.gov/midas/nsd";

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ SubmitConfirmComponent, CommonModule, NoopAnimationsModule, StaffDirModule, HttpClientTestingModule ],
            providers: [
                UserMessageService,
                { provide: StaffDirectoryService, useValue: { setAuthToken: () => {} } },
                { provide: AuthenticationService, useValue: {
                    getCredentials: () => of({userId: "test", userAttributes: null, token: "fake token"})
                } },
                { provide: MatDialogRef, useValue: { close: () => {} } },
                { provide: ElementRef, useValue: { nativeElement: { contains: () => false } } },
                { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
                { provide: GlobalService, useValue: {
                    watchSubmissionData: () => {},
                    watchColorPalette: (callback) => {
                        // Call the callback with a mock color palette
                        callback({
                            defaultVar: '#ffffff',
                            lighterVar: '#f0f0f0',
                            hoverVar: '#e0e0e0'
                        });
                    }
                } },
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                    new UserMessageService(), edstatsvc, dapsvc, null)
                }
            ],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        let req = httpMock.expectOne('assets/config.json');
        req.flush({
            staffdir: {
                serviceEndpoint: svcep
            }
        });

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SubmitConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
