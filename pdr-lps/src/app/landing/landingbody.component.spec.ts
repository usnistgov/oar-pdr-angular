import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingBodyComponent } from './landingbody.component';
import { AppConfig } from 'oarlps';
import { NerdmRes, NerdmComp } from 'oarlps';
import { MetadataUpdateService } from 'oarlps';
import { UserMessageService } from 'oarlps';
import { AuthService, WebAuthService, MockAuthService } from 'oarlps';
import { GoogleAnalyticsService } from 'oarlps';
import { CartService } from 'oarlps';
import * as environment from '../../environments/environment';
import { MetricsData } from "./metrics-data";
import { AngularEnvironmentConfigService } from 'oarlps';
import { TransferState } from '@angular/platform-browser';

describe('LandingBodyComponent', () => {
    let component: LandingBodyComponent;
    let fixture: ComponentFixture<LandingBodyComponent>;
    let cfg : AppConfig = new AppConfig(environment.config);
    let authsvc : AuthService = new MockAuthService(undefined, environment);
    let record1 : NerdmRes = environment.testdata['test1'];
    debugger;
    
    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [ HttpClientModule, RouterTestingModule ],
            declarations: [ LandingBodyComponent ],
            providers: [
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc }, 
                GoogleAnalyticsService, UserMessageService, MetadataUpdateService, DatePipe,
                CartService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LandingBodyComponent);
        component = fixture.componentInstance;
    }
  
    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.mobileMode = false;
        component.md = JSON.parse(JSON.stringify(record1));
        component.md["@type"][0] = "nrdp:PublicDataResource";
        component.metricsData = new MetricsData();
        component.editEnabled = false;
        fixture.detectChanges();
    }));

    it('should create', () => {
        debugger;
      expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        fakeAsync(() => {
            expect(component).toBeTruthy();
            let cmpel = fixture.nativeElement;
            expect(cmpel.querySelector("#resourcebody")).toBeTruthy();

            let sect = cmpel.querySelector("#identity");
            expect(sect).toBeTruthy();
            let title = sect.querySelector("h2");
            expect(title).toBeTruthy();
            expect(title.textContent).toContain("MEDS-I")

            sect = cmpel.querySelector("#description")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("Description");

            sect = cmpel.querySelector("#dataAccess")
            console.log("sect", sect);
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("Data Access");

            sect = cmpel.querySelector("#references")
            console.log("sect", sect);
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("References");

            sect = cmpel.querySelector("#about")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            console.log("title", title);
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("About This Dataset");
        });
    });    
});

