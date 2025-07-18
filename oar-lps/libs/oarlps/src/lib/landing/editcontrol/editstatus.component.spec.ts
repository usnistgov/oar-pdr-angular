import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { CommonModule, DatePipe } from '@angular/common';

import { EditStatusComponent } from './editstatus.component';
import { EditStatusService } from './editstatus.service';
import { MetadataUpdateService } from './metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import { UpdateDetails } from './interfaces';
import { LandingConstants } from '../constants';
import { AppConfig } from '../../config/config';
import { config, testdata } from '../../../environments/environment';
import { Credentials, UserAttributes } from 'oarng';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../nerdm/dap.service';
import * as env from '../../../environments/environment';

describe('EditStatusComponent', () => {
    let component : EditStatusComponent;
    let fixture : ComponentFixture<EditStatusComponent>;
    let authsvc : AuthService = new MockAuthService(undefined);
    let cfg : AppConfig = new AppConfig(null);
    config['editEnabled'] = true;
    cfg.loadConfig(config);
    let userAttributes: UserAttributes = {
        'userName': 'test01',
        'userLastName': 'NIST',
        'userEmail': 'test01@nist.gov'
    }
    let updateDetails: UpdateDetails = {
        'userAttributes': userAttributes,
        '_updateDate': '2025 April 1'
    }

    let EDIT_MODES = LandingConstants.editModes;

    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [ CommonModule, EditStatusComponent ],
            declarations: [  ],
            providers: [
                    UserMessageService, 
                    HttpHandler,
                    DatePipe,
                    { provide: AppConfig, useValue: cfg },
                    { provide: AuthService, useValue: authsvc },
                    { provide: DAPService, useFactory: createDAPService, 
                        deps: [ env, HttpClient, AppConfig ] },
                    { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                        new UserMessageService(), edstatsvc, dapsvc, null)
                    }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EditStatusComponent);
        component = fixture.componentInstance;
        component._editmode = EDIT_MODES.EDIT_MODE;
        component.showMsg = true;
    }
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        makeComp();
        fixture.detectChanges();
        component.message = "Hello";

    }));

    it('should initialize', () => {
        expect(component).toBeDefined();
        expect(component.updateDetails).toBe(null);
        expect(component.message).toBe("Hello");
        expect(component.messageColor).toBe("black");
        expect(component.isProcessing).toBeFalsy();

        let cmpel = fixture.nativeElement;

        let bardiv = cmpel.querySelector(".ec-status-bar");
        expect(bardiv).not.toBeNull();
        expect(bardiv.childElementCount).toBe(1);
        expect(bardiv.firstElementChild.tagName).toEqual("SPAN");
    });

    it('showMessage()', () => {
        component.showMessage("Okay, Boomer.", false, "sicklyGreen");
        expect(component.message).toBe("Okay, Boomer.");
        expect(component.messageColor).toBe("sicklyGreen");
        expect(component.isProcessing).toBeFalsy();
        fixture.detectChanges();

        let cmpel = fixture.nativeElement;
        let bardiv = cmpel.querySelector(".ec-status-bar");
        expect(bardiv).not.toBeNull();
        expect(bardiv.lastElementChild.innerHTML).toContain("Okay, Boomer.");

        component.showMessage("Wait...", true, "blue");
        expect(component.message).toBe("Wait...");
        expect(component.messageColor).toBe("blue");
        expect(component.isProcessing).toBeTruthy();
        fixture.detectChanges();

        expect(bardiv.lastElementChild.innerHTML).toContain("Wait...");
    });

    it('showLastUpdate()', () => {
        expect(component.updateDetails).toBe(null);

        component._editmode = EDIT_MODES.PREVIEW_MODE;
        component.showLastUpdate();
        expect(component.message).toContain("To see any previously");
        fixture.detectChanges();
        let cmpel = fixture.nativeElement;
        let bardiv = cmpel.querySelector(".ec-status-bar");
        expect(bardiv).toBeNull();
        
        component._editmode = EDIT_MODES.EDIT_MODE;
        fixture.detectChanges();
        cmpel = fixture.nativeElement;
        bardiv = cmpel.querySelector(".ec-status-bar");
        expect(bardiv.children[0].children[0].innerHTML).toContain('To see any previously edited inputs');

        component.setLastUpdateDetails(updateDetails);

        component._editmode = EDIT_MODES.EDIT_MODE;
        component.showLastUpdate();
        expect(component.message).toContain("Edited by test01 NIST on 2025 April 1");
        fixture.detectChanges();
        expect(bardiv.firstElementChild.firstElementChild.innerHTML).toContain('Edited by test01 NIST on 2025 April 1');

        component._editmode = EDIT_MODES.DONE_MODE;
        component.showLastUpdate();
        expect(component.message).toBe('');
    });


});
