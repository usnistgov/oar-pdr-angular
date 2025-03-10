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
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { environment } from '../../../../environments/environment-impl';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { CommonModule } from '@angular/common';
import { LandingConstants } from '../../../shared/globals/globals';

describe('TitleEditComponent', () => {
    let component: TitleEditComponent;
    let fixture: ComponentFixture<TitleEditComponent>;
    let cfg = new AppConfig(null);
    cfg.loadConfig(env.config)
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc : AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
    
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, FormsModule, ToastrModule.forRoot()],
            providers: [
                UserMessageService, 
                HttpHandler,
                DatePipe,
                { provide: AppConfig, useValue: cfg },
                { provide: AuthService, useValue: authsvc },
                { provide: DAPService, useFactory: createDAPService, 
                    deps: [ environment, HttpClient, AppConfig ] },
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                    new UserMessageService(), edstatsvc, dapsvc, null)
                } 
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
        component.edstatsvc = edstatsvc;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('editMode', () => {
        edstatsvc.editMode.set(LandingConstants.editModes.EDIT_MODE);
        expect(edstatsvc.isEditMode()).toBeTruthy();

        fixture.detectChanges();
        let buttonElement = fixture.nativeElement.querySelector('button');
        expect(buttonElement).toBeTruthy();

        edstatsvc.editMode.set(LandingConstants.editModes.DONE_MODE);
        expect(edstatsvc.isEditMode()).toBeFalsy();

        fixture.detectChanges();
        buttonElement = fixture.nativeElement.querySelector('button');
        expect(buttonElement).toBeFalsy();
    })
});
