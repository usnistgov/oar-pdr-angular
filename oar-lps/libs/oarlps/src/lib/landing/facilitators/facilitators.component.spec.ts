import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, DatePipe } from '@angular/common';

import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { FacilitatorsComponent } from './facilitators.component';
import { AppConfig } from '../../config/config';
import { LandingpageService } from '../landingpage.service';
import { EditStatusService } from '../../landing/editcontrol/editstatus.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { AuthService, MockAuthService } from '../editcontrol/auth.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { config, testdata } from '../../../environments/environment';
import { TransferState } from '@angular/core';

describe('FacilitatorsComponent', () => {
    let component: FacilitatorsComponent;
    let fixture: ComponentFixture<FacilitatorsComponent>;
    let rec : NerdmRes = testdata['test1'];
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let authsvc = new MockAuthService();  

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ FacilitatorsComponent ],
            imports: [ CommonModule ],
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
    });

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
