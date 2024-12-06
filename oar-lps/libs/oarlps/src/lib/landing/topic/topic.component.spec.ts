import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TopicModule, TopicComponent } from './topic.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { AppConfig, LPSConfig } from '../../config/config';
import { TransferState } from '@angular/platform-browser';
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
        cfg = new AppConfig(null);
        let cfgd: LPSConfig = JSON.parse(JSON.stringify(env.config));
        cfgd.links.pdrSearch = "https://goob.nist.gov/search";
        cfgd.status = "Unit Testing";
        cfgd.appVersion = "2.test";
        cfg.loadConfig(cfgd);

        TestBed.configureTestingModule({
            imports: [TopicModule, FormsModule, HttpClientTestingModule, RouterTestingModule,
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

    it('Research Topics should contains Manufacturing: Factory communications', () => {
        let cmpel = fixture.nativeElement;
        let aels = cmpel.querySelectorAll(".topics");
        expect(aels.length).toEqual(3);
        expect(aels[0].innerHTML).toContain('Manufacturing: Factory communications');
      });
    
});
