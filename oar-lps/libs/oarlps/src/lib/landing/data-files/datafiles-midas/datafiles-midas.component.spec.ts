import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { fakeAsync, tick, ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../datacart/cart.service';
import { DataCart } from '../../../datacart/cart';
import { CartConstants } from '../../../datacart/cartconstants';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DownloadService } from '../../../shared/download-service/download-service.service';
import { TestDataService } from '../../../shared/testdata-service/testDataService';
import { AppConfig } from '../../../config/config';
import { TransferState } from '@angular/core';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { ToastrModule } from 'ngx-toastr';
import { TreeTableModule } from 'primeng/treetable';
import { EditStatusService } from '../../../landing/editcontrol/editstatus.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import * as env from '../../../../environments/environment';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { AuthService, WebAuthService, MockAuthService } from '../../editcontrol/auth.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { DatafilesMidasComponent } from './datafiles-midas.component';

describe('DatafilesMidasComponent', () => {
    let component: DatafilesMidasComponent;
    let fixture: ComponentFixture<DatafilesMidasComponent>;
    let cfg: AppConfig;
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    // beforeEach(async () => {
    //     await TestBed.configureTestingModule({
    //     imports: [DatafilesMidasComponent]
    //     })
    //     .compileComponents();

    //     fixture = TestBed.createComponent(DatafilesMidasComponent);
    //     component = fixture.componentInstance;
    //     fixture.detectChanges();
    // });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    beforeEach(waitForAsync(() => {
        let dc: DataCart = DataCart.openCart(CartConstants.cartConst.GLOBAL_CART_NAME);
        dc._forget();

        cfg = new AppConfig(null);
        cfg.loadConfig(env.config)

        TestBed.configureTestingModule({
            declarations: [],
            imports: [FormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                DatafilesMidasComponent,
                TreeTableModule,
                BrowserAnimationsModule,
                ToastrModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA],
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
                },
                CartService,
                DownloadService,
                TestDataService,
                GoogleAnalyticsService
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        let record: any = require('../../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(DatafilesMidasComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        component.ngOnChanges({});
        fixture.detectChanges();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should have title Files', () => {
        component.editEnabled = true;
        fixture.detectChanges();
        fakeAsync(() => {
            expect(fixture.nativeElement.querySelectorAll('#filelist-heading').length).toEqual(1);
            expect(fixture.nativeElement.querySelector('#filelist-heading').innerText).toEqual('Files ');
        });
    });
});
