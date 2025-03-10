import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TransferState } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { ModalService, LPSConfig } from 'oarlps';
import { LandingPageComponent } from './landingpage.component';
import { AppConfig } from 'oarlps'
import { MetadataTransfer, NerdmRes } from 'oarlps'
import { MetadataUpdateService } from 'oarlps';
import { UserMessageService } from 'oarlps';
import { AuthService, WebAuthService, MockAuthService } from 'oarlps';
import { CartService } from "oarlps";
import { DownloadService } from "oarlps";
import { TestDataService } from 'oarlps';
import { GoogleAnalyticsService } from 'oarlps';
import * as mock from '../testing/mock.services';
import {RouterTestingModule} from "@angular/router/testing";
import * as environment from '../../environments/environment';
import { CommonFunctionService } from "oarlps";
import { NERDmResourceService, ServerDiskCacheResourceService, TransferResourceService } from 'oarlps';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from 'oarlps';
import { EditStatusService } from 'oarlps';

describe('LandingPageComponent', () => {
    let component : LandingPageComponent;
    let fixture : ComponentFixture<LandingPageComponent>;
    let cfg : AppConfig;
    let nrd10 : NerdmRes;
    let mdt : MetadataTransfer;
    let route : ActivatedRoute;
    let authsvc : AuthService = new MockAuthService()
    let router : Router;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    let routes : Routes = [
        { path: 'od/id/:id', component: LandingPageComponent },
        { path: 'od/id/ark:/88434/:id', component: LandingPageComponent }
    ];

    beforeEach(() => {
        cfg = new AppConfig(null);
        let cfgd: LPSConfig = JSON.parse(JSON.stringify(environment.config));
        cfgd.links.pdrSearch = "https://goob.nist.gov/search";
        cfgd["status"] = "Unit Testing";
        cfgd["appVersion"] = "2.test";
        cfgd["editEnabled"] = false;
        cfg.loadConfig(cfgd);

        nrd10 = environment.testdata['test1'];
        /*
        nrd = {
            "@type": [ "nrd:SRD", "nrdp:DataPublication", "nrdp:DataPublicResource" ],
            "@id": "goober",
            title: "All About Me!"
        }
        */
        mdt = new MetadataTransfer();
        mdt.set("goober", nrd10)

        let r : unknown = new mock.MockActivatedRoute("/id/goober", {id: "goober"});
        route = r as ActivatedRoute;
    });

    let setupComponent = function() {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule, NoopAnimationsModule,
                RouterTestingModule.withRoutes(routes), 
                ToastrModule.forRoot({
                    toastClass: 'toast toast-bootstrap-compatibility-fix'
                })
            ],
            providers: [
                { provide: ActivatedRoute, useValue: route },
                { provide: ElementRef, useValue: null },
                UserMessageService, 
                MetadataUpdateService, 
                DatePipe,
                HttpHandler,
                CartService, 
                DownloadService, 
                TestDataService, 
                GoogleAnalyticsService,
                ModalService, 
                CommonFunctionService,
                { provide: NERDmResourceService, useValue: new TransferResourceService(mdt)},
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                { provide: DAPService, useFactory: createDAPService, 
                    deps: [ environment, HttpClient, AppConfig ] },
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                    new UserMessageService(), edstatsvc, dapsvc, null)
                }

            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(LandingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it("should set title bar", function() {
        setupComponent();
        expect(component).toBeTruthy();
        // expect(component.getDocumentTitle()).toBe("PDR: "+nrd10.title);
    });

});
