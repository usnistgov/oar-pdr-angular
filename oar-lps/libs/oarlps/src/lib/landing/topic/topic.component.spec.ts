import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TopicComponent } from './topic.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { AppConfig } from '../../config/config';
import { AngularEnvironmentConfigService } from '../../config/config.service';
import { TransferState } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';

describe('TopicComponent', () => {
    let component: TopicComponent;
    let fixture: ComponentFixture<TopicComponent>;
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
                TopicComponent,
                FormsModule, 
                HttpClientTestingModule, 
                RouterTestingModule,
                ToastrModule.forRoot()],
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
        let record: any = require('../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(TopicComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Topic will move from "theme" field to "topic" field. Will fix the following once decided.
    // it('Research Topics should contains Manufacturing: Factory communications', () => {
    //     let cmpel = fixture.nativeElement;
    //     let aels = cmpel.querySelectorAll(".topics");
    //     expect(aels.length).toEqual(3);
    //     expect(aels[0].innerHTML).toContain('Manufacturing: Factory communications');
    //   });
    
});
