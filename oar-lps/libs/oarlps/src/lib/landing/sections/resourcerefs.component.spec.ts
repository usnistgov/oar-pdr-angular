import { ComponentFixture, TestBed, ComponentFixtureAutoDetect, waitForAsync  } from '@angular/core/testing';
import { ResourceRefsComponent } from './resourcerefs.component';
import { AppConfig } from '../../config/config';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { config, testdata } from '../../../environments/environment';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

describe('ResourceRefsComponent', () => {
    let component: ResourceRefsComponent;
    let fixture: ComponentFixture<ResourceRefsComponent>;
    let cfg : AppConfig = new AppConfig(config);
    let rec : NerdmRes = testdata['test1'];
    let authsvc : AuthService = new MockAuthService(null, env);

    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [
                ResourceRefsComponent,
                ToastrModule.forRoot()
             ],
            declarations: [  ],
            providers: [
                { provide: AppConfig, useValue: cfg },
                GoogleAnalyticsService,
                MetadataUpdateService,
                UserMessageService,
                { provide: AuthService, useValue: authsvc },
                DatePipe, 
                GoogleAnalyticsService,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ResourceRefsComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
