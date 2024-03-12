import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { DescriptionModule, DescriptionComponent } from './description.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../config/config';
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { TransferState } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';

describe('DescriptionComponent', () => {
    let component: DescriptionComponent;
    let fixture: ComponentFixture<DescriptionComponent>;
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc : AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
        cfg = (new AngularEnvironmentConfigService(env, plid, ts)).getConfig() as AppConfig;
        cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        cfg.status = "Unit Testing";
        cfg.appVersion = "2.test";

        TestBed.configureTestingModule({
            imports: [
                DescriptionModule,
                FormsModule, HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot()
            ],
            declarations: [],
            providers: [
                MetadataUpdateService, UserMessageService, DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescriptionComponent);
        component = fixture.componentInstance;
        component.record = require('../../../assets/sampleRecord.json');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
