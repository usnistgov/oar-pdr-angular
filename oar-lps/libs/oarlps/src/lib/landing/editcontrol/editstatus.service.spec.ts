import { EditStatusService } from './editstatus.service';
import { UpdateDetails } from './interfaces';
import { LandingConstants } from '../../shared/globals/globals';
import { UserAttributes } from 'oarng';
import { AuthService, MockAuthService } from './auth.service';
import { TestBed, waitForAsync } from '@angular/core/testing';

describe('EditStatusService', () => {
    let svc : EditStatusService = null;
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
    let authsvc: AuthService = new MockAuthService(undefined);
    
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        imports: [
        ],
        providers: [
            { provide: AuthService, useValue: authsvc }
        ]
        }).compileComponents();
    }));

    beforeEach(() => {
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


               
                                 
        
        
