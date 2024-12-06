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

describe('ResourceDataComponent', () => {
    let component: ResourceDataComponent;
    let fixture: ComponentFixture<ResourceDataComponent>;
    let rec : NerdmRes = require('../../../assets/sampleRecord.json');

    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [ HttpClientModule ],
            declarations: [  ],
            providers: [
                GoogleAnalyticsService, 
                UserMessageService, 
                MetadataUpdateService, 
                DatePipe,
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
