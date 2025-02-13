import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { TopicEditComponent } from './topic-edit.component';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import { config, testdata } from '../../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('TopicEditComponent', () => {
    let component: TopicEditComponent;
    let fixture: ComponentFixture<TopicEditComponent>;
    let cfg = new AppConfig(null);
    cfg.loadConfig(config);  
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        imports: [ 
            TopicEditComponent,
            HttpClientTestingModule, 
            ToastrModule.forRoot() ],
        providers: [ 
            MetadataUpdateService, 
            DatePipe,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            UserMessageService ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
