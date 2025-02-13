import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NerdmRes } from '../../nerdm/nerdm';
import { FacilitatorsComponent } from './facilitators.component';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { config, testdata } from '../../../environments/environment';
import { AppConfig } from '../../config/config';
import { LandingpageService } from '../landingpage.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { DatePipe } from '@angular/common';
import { AuthService, MockAuthService } from '../editcontrol/auth.service';

describe('FacilitatorsComponent', () => {
    let component: FacilitatorsComponent;
    let fixture: ComponentFixture<FacilitatorsComponent>;
    let rec : NerdmRes = testdata['test1'];
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let authsvc = new MockAuthService();  

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ FacilitatorsComponent ],
            providers: [
                LandingpageService,
                EditStatusService,
                DatePipe,
                UserMessageService,
                { provide: AuthService, useValue: authsvc },
                MetadataUpdateService,
                { provide: AppConfig, useValue: cfg }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FacilitatorsComponent);
        component = fixture.componentInstance;
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
