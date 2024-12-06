import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ReferencesComponent } from './references.component';
import { UserMessageService } from '../../frame/usermessage.service';
import { AppConfig } from '../../config/config';
import { TransferState } from '@angular/platform-browser';
import * as env from '../../../environments/environment';
import { AuthService, WebAuthService, MockAuthService } from '../editcontrol/auth.service';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { config, testdata } from '../../../environments/environment';
import { NerdmRes, NerdmComp } from '../../nerdm/nerdm';

describe('ReferencesComponent', () => {
    let component: ReferencesComponent;
    let fixture: ComponentFixture<ReferencesComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let plid: Object = "browser";
    let ts: TransferState = new TransferState();
    let authsvc: AuthService = new MockAuthService(undefined);
    let rec : NerdmRes = testdata['test1'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        declarations: [ ReferencesComponent ],
        imports: [ HttpClientTestingModule, ToastrModule.forRoot() ],
        providers: [ 
            MetadataUpdateService, 
            DatePipe,
            { provide: AppConfig, useValue: cfg },
            { provide: AuthService, useValue: authsvc },
            UserMessageService ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferencesComponent);
        component = fixture.componentInstance;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should initialize', () => {
        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;
        debugger;
        expect(cmpel.querySelector("#references")).toBeTruthy();

        // has a section heading
        let el = cmpel.querySelector("h3");
        expect(el).toBeTruthy();
        expect(el.textContent).toContain("References");

        // has 2 references
        let els = cmpel.querySelectorAll("a")
        expect(els.length).toBe(2);
    });

    it('should suppress for empty list', () => {
        expect(component).toBeTruthy();
        component.record['references'] = [];
        fixture.detectChanges();

        let cmpel = fixture.nativeElement;
        expect(cmpel.querySelector("#references")).toBeTruthy();
        expect(cmpel.querySelector("h3")).toBeFalsy();
        let els = cmpel.querySelectorAll("a")
        expect(els.length).toBe(0);
    });

    it('should not render ref as a link without location', () => {
        // remove the locations from the two reference
        component.record['references'][0]['location'] = null;
        delete component.record['references'][1].location;
        fixture.detectChanges();

        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;
        let reflist = cmpel.querySelector("#references");
        expect(reflist).toBeTruthy();

        // has 2 references
        let els = cmpel.querySelectorAll(".ref-entry")
        expect(els.length).toBe(2);
        els = cmpel.querySelectorAll("a");
        expect(els.length).toBe(0);
    });
});
