import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TitleComponent } from './title.component';
import { AppConfig } from '../../config/config';
import { Component, TransferState } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import * as env from '../../../environments/environment';
import { TitlePubComponent } from './title-pub/title-pub.component';
import { TitleEditComponent } from './title-edit/title-edit.component';

describe('TitleComponent', () => {
    let component: TitleComponent;
    let fixture: ComponentFixture<TitleComponent>;
    let cfg = new AppConfig(null);
    cfg.loadConfig(env.config)
    let authsvc : AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
        @Component({
            selector: "accesspage-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestTitlePubComponent {}

        @Component({
            selector: "pdr-data-files",
            standalone: true,
            template: `<div></div>`,
        })
        class TestTitleEditComponent {}

        TestBed.overrideComponent(TitleComponent, {
            add: {
                imports: [
                    TestTitlePubComponent,
                    TestTitleEditComponent
                ],
            },
            remove: {
                imports: [
                    TitlePubComponent,
                    TitleEditComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        let record: any = require('../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(TitleComponent);
        component = fixture.componentInstance;
        component.record = record;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
