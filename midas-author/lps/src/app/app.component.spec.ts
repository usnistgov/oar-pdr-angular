import { TestBed, waitForAsync  } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedModule } from 'oarlps';
import { FrameModule } from 'oarng';
import { GoogleAnalyticsService } from "oarlps";
import { ConfigModule } from 'oarlps';
import { BrowserModule } from '@angular/platform-browser';
import { TransferState, StateKey } from '@angular/platform-browser';
import { AppConfig } from 'oarlps';
import { CartService } from 'oarlps';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import * as environment from '../environments/environment';
import { AuthModule, AuthenticationService, OARAuthenticationService, MockAuthenticationService } from 'oarng';

describe('AppComponent', () => {
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();

    beforeEach(waitForAsync(() => {
        cfg = new AppConfig(null);
        cfg.loadConfig(JSON.parse(JSON.stringify(environment.config)));

        TestBed.configureTestingModule({

            declarations: [
                AppComponent,
            ], 
            providers: [
                GoogleAnalyticsService, 
                CartService,
                { provide: AppConfig, useValue: cfg },
                MockAuthenticationService,
                AuthenticationService
            ]
            , imports: [RouterTestingModule, FrameModule, BrowserModule, HttpClientTestingModule, ToastrModule.forRoot()],
        }).compileComponents();
    }));

    it('should create the app', waitForAsync(() => {
        debugger;
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;

        fixture.whenStable().then(() => {
            expect(app).toBeTruthy();
        })
    }));

    it(`should have as title 'PDR Resource Landing Page'`, waitForAsync(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;

        fixture.whenStable().then(() => {
            expect(app.title).toEqual('PDR Resource Landing Page');
        })
    }));

});
