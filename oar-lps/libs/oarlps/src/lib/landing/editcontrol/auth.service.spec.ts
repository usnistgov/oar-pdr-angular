import { TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransferState } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { AuthService, WebAuthService, MockAuthService, createAuthService } from './auth.service';
import { CustomizationService } from './customization.service';
import { AppConfig } from '../../config/config';
import { testdata, config } from '../../../environments/environment';
import { UserMessageService } from '../../frame/usermessage.service';
import * as env from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { AuthModule, AuthenticationService, OARAuthenticationService } from 'oarng';

describe('WebAuthService', () => {

    let rec = testdata['test1'];
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    let svc: AuthenticationService;

    beforeEach(() => {
        cfg = new AppConfig(null);
        cfg.loadConfig(env.config)

        TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule, ToastrModule.forRoot() ],
        providers: [ 
            MetadataUpdateService, 
            AuthenticationService,
            DatePipe,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            UserMessageService ]
        });
        svc = TestBed.inject(AuthenticationService);
    });

    it('init state', () => {
        expect(svc).toBeTruthy();
    });
});

describe('MockAuthService', () => {

    let rec = testdata['test1'];
    let svc : MockAuthService = null;

    beforeEach(() => {
        svc = new MockAuthService();
    });

    it('init state', () => {
        expect(svc.userID).toBe("anon");
        expect(svc.isAuthorized()).toBeTruthy();
    });

    // it('authorizeEditing()', async () => {
    //     let custsvc : CustomizationService = await svc.authorizeEditing(rec.ediid).toPromise();
    //     expect(custsvc).toBeTruthy();
    //     expect(await custsvc.getDraftMetadata().toPromise()).toEqual(rec);
    // });
});

// describe('createAuthService()', () => {
//     let httpcli : HttpClient = null;
//     let cfg : AppConfig;
//     let plid : Object = "browser";
//     let ts : TransferState = new TransferState();

//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             imports: [ HttpClientModule ]
//         });
//         httpcli = TestBed.inject(HttpClient);
//         cfg = (new AngularEnvironmentConfigService(plid, ts)).getConfig();
//     }));
    
//     it('supports dev mode', () => {
//         let as : AuthService = createAuthService(cfg, httpcli, true);
//         expect(as instanceof MockAuthService).toBeTruthy();
//     });

//     it('supports prod mode', () => {
//         let as : AuthService = createAuthService(cfg, httpcli, false);
//         expect(as instanceof WebAuthService).toBeTruthy();
//     });

// });
