import { ComponentFixture, TestBed, fakeAsync  } from '@angular/core/testing';
import { KeywordMidasComponent } from './keyword-midas.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../../config/config';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import * as env from '../../../../environments/environment';

describe('KeywordMidasComponent', () => {
    let component: KeywordMidasComponent;
    let fixture: ComponentFixture<KeywordMidasComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(env.config);
    let authsvc: AuthService = new MockAuthService(undefined);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KeywordMidasComponent,
                FormsModule, HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot()
            ],
            declarations: [],
            providers: [
                MetadataUpdateService, UserMessageService, DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        let record: any = require('../../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(KeywordMidasComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Subject Keywords should Wireless', () => {
        let cmpel = fixture.nativeElement;

        fakeAsync(() => {
            let aels = cmpel.querySelectorAll(".keywords");
            expect(aels.length).toEqual(5);
            expect(aels[0].innerText).toContain('IoT');
            expect(aels[1].innerText).toContain('Wireless');
            expect(aels[2].innerText).toContain('RF');
            expect(aels[3].innerText).toContain('Manufacturing');
            expect(aels[4].innerText).toContain('Node.js');
        });
    });
});
