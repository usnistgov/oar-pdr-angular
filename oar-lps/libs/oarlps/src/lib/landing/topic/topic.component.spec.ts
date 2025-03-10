import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TopicComponent } from './topic.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../nerdm/dap.service';
import { EditStatusService } from '../editcontrol/editstatus.service';

describe('TopicComponent', () => {
    let component: TopicComponent;
    let fixture: ComponentFixture<TopicComponent>;
    let cfg = new AppConfig(null);
    cfg.loadConfig(env.config)
    let authsvc : AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                TopicComponent,
                FormsModule, 
                HttpClientTestingModule, 
                RouterTestingModule,
                ToastrModule.forRoot()],
            declarations: [],
            providers: [
                UserMessageService, 
                HttpHandler,
                DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                { provide: DAPService, useFactory: createDAPService, 
                    deps: [ env, HttpClient, AppConfig ] },
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                    new UserMessageService(), edstatsvc, dapsvc, null)
                }
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
