import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { SidebarComponent } from './sidebar.component';
import { MetadataUpdateService } from '../landing/editcontrol/metadataupdate.service';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { Component } from '@angular/core';
import { AppConfig } from '../config/config';
import { TransferState } from '@angular/core';
import * as env from '../../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { AuthService, MockAuthService } from '../landing/editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../nerdm/dap.service';
import { environment } from '../../environments/environment-impl';
import { EditStatusService } from '../landing/editcontrol/editstatus.service';
import { UserMessageService } from '../frame/usermessage.service';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let authsvc: AuthService = new MockAuthService(undefined);
    let record: any = require('../../assets/sampleRecord.json');
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    let makeComp = function() {
        @Component({
            selector: "suggestions",
            standalone: true,
            template: `<div></div>`,
        })
        class TestSuggestionsComponent {}

        TestBed.overrideComponent(SidebarComponent, {
            add: {
                imports: [
                    TestSuggestionsComponent
                ],
            },
            remove: {
                imports: [
                    SuggestionsComponent
                ],
            },
        });

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
    }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [BrowserAnimationsModule, SidebarComponent],
        providers: [
            { provide: AppConfig, useValue: cfg },
            { provide: DAPService, useFactory: createDAPService, 
                deps: [ environment, HttpClient, AppConfig ] },
            { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                new UserMessageService(), edstatsvc, dapsvc, null)
            } 
        ]
    })
    .compileComponents();

    makeComp();
  });

  beforeEach(() => {
    let record: any = require('../../assets/sampleRecord.json');
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.record = record;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
