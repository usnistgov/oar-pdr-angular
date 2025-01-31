import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// import { RouterTestingModule } from '@angular/router/testing';
import { ResourceDataComponent } from './resourcedata.component';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { CartService } from '../../datacart/cart.service';
import { Themes, ThemesPrefs } from '../../shared/globals/globals';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../../environments/environment';
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import { ToastrModule } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('ResourceDataComponent', () => {
    let component: ResourceDataComponent;
    let fixture: ComponentFixture<ResourceDataComponent>;
    let rec : NerdmRes = require('../../../assets/sampleRecord.json');
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);

    let makeComp = function() {
        cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
        cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        cfg.status = "Unit Testing";
        cfg.appVersion = "2.test";

        TestBed.configureTestingModule({
            imports: [ 
                ResourceDataComponent, 
                HttpClientModule, 
                NoopAnimationsModule,
                ToastrModule.forRoot() ],
            declarations: [  ],
            providers: [
                GoogleAnalyticsService, 
                DatePipe,
                CartService,
                MetadataUpdateService, 
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                UserMessageService,
                provideRouter([]) 
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ResourceDataComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        component.theme = Themes.DEFAULT_THEME;
        component.ngOnChanges({});
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        component.hasRights = true;
        fixture.detectChanges();

        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;

        expect(cmpel.querySelector("#dataAccess")).toBeTruthy();

        // lists access pages
        expect(cmpel.querySelector("#accessPages")).toBeTruthy();

        // shows access rights 
        fakeAsync(() => {
            expect(cmpel.querySelector("#accessRights")).toBeTruthy();
        });

        // lists files - no filelisting in html
        // expect(cmpel.querySelector("#filelisting")).toBeTruthy();
    });
});
