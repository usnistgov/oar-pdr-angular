import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { FacilitatorsComponent } from './facilitators.component';
import { config, testdata } from '../../../environments/environment';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import * as env from '../../../environments/environment';
import { TransferState } from '@angular/core';
import { AppConfig } from '../../config/config'
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { AuthService } from '../editcontrol/auth.service';
import { DatePipe } from '@angular/common';

describe('FacilitatorsComponent', () => {
    let component: FacilitatorsComponent;
    let fixture: ComponentFixture<FacilitatorsComponent>;
    let rec : NerdmRes = testdata['test1'];
    let plid : Object = "browser";
    let ts : TransferState = new TransferState();
    let cfg : AppConfig = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
    let nrd1 = testdata['forensics'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ FacilitatorsComponent ],
            providers: [ 
                MetadataUpdateService, 
                UserMessageService,
                AuthService,
                DatePipe,
                { provide: AppConfig,       useValue: cfg }
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
