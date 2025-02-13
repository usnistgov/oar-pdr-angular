import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { TitleEditComponent } from './title-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import { AuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { env } from '../../../../environments/environment';

describe('TitleEditComponent', () => {
    let component: TitleEditComponent;
    let fixture: ComponentFixture<TitleEditComponent>;
    let cfg = new AppConfig(null);
    cfg.loadConfig(env.config)
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc : AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ToastrModule.forRoot()],
            providers: [
                MetadataUpdateService, UserMessageService, DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        let record: any = require('../../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(TitleEditComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
