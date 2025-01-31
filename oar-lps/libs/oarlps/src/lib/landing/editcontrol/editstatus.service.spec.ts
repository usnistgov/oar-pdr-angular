import { EditStatusService } from './editstatus.service';
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { AppConfig } from '../../config/config'
import { config } from '../../../environments/environment'
import { UpdateDetails } from './interfaces';
import { LandingConstants } from '../constants';
import { Credentials, UserAttributes } from 'oarng';
import { AuthService, WebAuthService, MockAuthService } from './auth.service';
import { TransferState } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { env } from '../../../environments/environment';

describe('EditStatusService', () => {

    let svc : EditStatusService = null;
    let cfgdata = null;
    // let cfg = null;
    let userAttributes: UserAttributes = {
        'userName': 'test01',
        'userLastName': 'NIST',
        'userEmail': 'test01@nist.gov'
    }
    let updateDetails: UpdateDetails = {
        'userAttributes': userAttributes,
        '_updateDate': 'today'
    }

    let EDIT_MODES = LandingConstants.editModes;
    // let cfg: AppConfig;
    // let plid: Object = "browser";
    // let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    
    beforeEach(waitForAsync(() => {
        // cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
        // cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        // cfg.status = "Unit Testing";
        // cfg.appVersion = "2.test";

        TestBed.configureTestingModule({
        imports: [
        ],
        providers: [
            // { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc }
        ]
        }).compileComponents();
    }));

    beforeEach(() => {
        cfgdata = JSON.parse(JSON.stringify(config));
        cfgdata['editEnabled'] = true;
        // svc = new EditStatusService(new AppConfig(cfgdata));
        svc = new EditStatusService();
    });

    it('initialize', () => {
        expect(svc.lastUpdated).toEqual(null);
        expect(svc.userID).toBeNull();
        expect(svc.authenticated).toBe(false);
        expect(svc.authorized).toBe(false);
        // expect(svc.editingEnabled()).toBe(true);
    });

    it('setable', () => {
        svc._setLastUpdated(updateDetails);
        svc._setEditMode(EDIT_MODES.EDIT_MODE);
        svc._setUserID("Hank");
        svc._setAuthorized(false);

        expect(svc.lastUpdated._updateDate).toEqual("today");
        expect(svc.lastUpdated.userAttributes).toEqual(userAttributes);
        expect(svc.userID).toEqual("Hank");
        expect(svc.authenticated).toBe(true);
        expect(svc.authorized).toBe(false);
    });

    it('watchable remote start', () => {
        let resID = "";
        svc._watchRemoteStart((ev) => {
            resID = ev.resID;
        });
        expect(resID).toEqual("");
        svc.startEditing("testid");
        expect(resID).toEqual("testid");
    });
});


               
                                 
        
        
