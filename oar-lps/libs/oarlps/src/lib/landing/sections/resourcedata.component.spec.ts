import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ResourceDataComponent } from './resourcedata.component';
import { AppConfig } from '../../config/config';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';
import { EditControlModule } from '../editcontrol/editcontrol.module';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { CartService } from '../../datacart/cart.service';
import { config, testdata } from '../../../environments/environment';
import { Themes, ThemesPrefs } from '../../shared/globals/globals';
import { By } from '@angular/platform-browser';

describe('ResourceDataComponent', () => {
    let component: ResourceDataComponent;
    let fixture: ComponentFixture<ResourceDataComponent>;
    let cfg : AppConfig = new AppConfig(config);
    let rec : NerdmRes = require('../../../assets/sampleRecord.json');

    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [ HttpClientModule, RouterTestingModule ],
            declarations: [  ],
            providers: [
                { provide: AppConfig, useValue: cfg },
                GoogleAnalyticsService, UserMessageService, MetadataUpdateService, DatePipe,
                CartService
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

        // has a title
        let el = cmpel.querySelector("h3");
        expect(el).toBeTruthy();
        expect(el.textContent).toContain("Data Access");

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
