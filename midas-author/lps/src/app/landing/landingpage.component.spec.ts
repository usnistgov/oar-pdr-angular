import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TransferState } from '@angular/platform-browser';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { ModalService } from 'oarlps';
import { LandingPageComponent } from './landingpage.component';
import { AngularEnvironmentConfigService } from 'oarlps';
import { AppConfig } from 'oarlps'
import { MetadataTransfer, NerdmRes } from 'oarlps'
import { MetadataService, TransferMetadataService } from 'oarlps'
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
import { IEnvironment } from '../../environments/ienvironment';

describe('LandingPageComponent', () => {
    debugger;
    let component : LandingPageComponent;
    let fixture : ComponentFixture<LandingPageComponent>;
    let cfg : AppConfig;
    let plid : Object = "browser";
    let ts : TransferState = new TransferState();
    let nrd10 : NerdmRes;
    let mdt : MetadataTransfer;
    let mds : MetadataService;
    let route : ActivatedRoute;
    let router : Router;
    let authsvc : AuthService = new MockAuthService();
    let ienv : IEnvironment;
    // let title : mock.MockTitle;

    let routes : Routes = [
        { path: 'od/id/:id', component: LandingPageComponent },
        { path: 'od/id/ark:/88434/:id', component: LandingPageComponent }
    ];

    beforeEach(() => {
        console.log('environment', environment);
        cfg = (new AngularEnvironmentConfigService(environment, plid, ts)).getConfig() as AppConfig;
        cfg.locations.pdrSearch = "https://goob.nist.gov/search";
        cfg.status = "Unit Testing";
        cfg.appVersion = "2.test";
        cfg.editEnabled = false;
        debugger;

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
        mds = new TransferMetadataService(mdt);

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
                { provide: ActivatedRoute,  useValue: route },
                { provide: ElementRef,      useValue: null },
                { provide: AppConfig,       useValue: cfg },
                { provide: MetadataService, useValue: mds },
                { provide: AuthService,     useValue: authsvc }, 
                UserMessageService, MetadataUpdateService, DatePipe,
                CartService, DownloadService, TestDataService, GoogleAnalyticsService, 
                ModalService, CommonFunctionService
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(LandingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it("should set title bar", function() {
        debugger;
        setupComponent();
        expect(component.getDocumentTitle()).toBe("PDR: "+nrd10.title);
    });


});
