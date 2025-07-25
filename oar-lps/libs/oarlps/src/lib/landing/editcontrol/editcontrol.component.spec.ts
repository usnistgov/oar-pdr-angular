import { ComponentFixture, TestBed, ComponentFixtureAutoDetect, waitForAsync  } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../config/config';
import { UserMessageService } from '../../frame/usermessage.service';
import { MetadataUpdateService } from './metadataupdate.service';
import { AuthService, MockAuthService } from './auth.service';
import { EditControlComponent } from './editcontrol.component';
import { EditControlModule } from './editcontrol.module';
import { DatePipe } from '@angular/common';
import { NerdmRes } from '../../nerdm/nerdm';
import * as env from '../../../environments/environment';
import { config, testdata } from '../../../environments/environment';
import { LandingConstants } from '../constants';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DAPService, createDAPService, LocalDAPService } from '../../nerdm/dap.service';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { AuthenticationService, MockAuthenticationService } from 'oarng';

describe('EditControlComponent', () => {
    let component : EditControlComponent;
    let fixture : ComponentFixture<EditControlComponent>;
    let cfg : AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let rec : NerdmRes = testdata['test1'];
    let authsvc : AuthService = new MockAuthService()
    let EDIT_MODES = LandingConstants.editModes;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();

    let makeComp = function() {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            declarations: [  ],
            providers: [
                    UserMessageService, 
                    {provide: AuthenticationService, useValue: new MockAuthenticationService(null)},
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
        }).compileComponents();

        fixture = TestBed.createComponent(EditControlComponent);
        component = fixture.componentInstance;
        component.mdrec = rec;
        // fixture.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        debugger
        expect(component).toBeDefined();

        let cmpel = fixture.nativeElement;
        let btns = cmpel.querySelectorAll("button");
        //Init with view only mode, no button will be displayed
        expect(btns.length).toEqual(0);
    });

    // it('can get authorized', async () => {
    //     expect(component.isAuthorized()).toBeFalsy();
    //     let authed : boolean = await component.authorizeEditing().toPromise();
    //     expect(authed).toBeTruthy();
    //     expect(component.isAuthorized()).toBeTruthy();
    // });

    // test startEditing()
    // it('startEditing()', waitForAsync(() => {
    //     let cmpel = fixture.nativeElement;
    //     let edbtn = cmpel.querySelector("#ec-edit-btn") 
    //     let discbtn = cmpel.querySelector("#ec-discard-btn") 
    //     let donebtn = cmpel.querySelector("#ec-close-btn") 
    //     let prevubtn = cmpel.querySelector("#ec-preview-btn")  
    //     expect(component._editMode).toBe(EDIT_MODES.VIEWONLY_MODE);
    //     expect(prevubtn).toBeNull();
    //     expect(edbtn).toBeNull();
    //     expect(donebtn).toBeNull();
    //     expect(discbtn).toBeNull();

    //     component.startEditing();
    //     fixture.whenStable().then(() => {
    //         fixture.detectChanges();
    //         expect(component._editMode).toBe(EDIT_MODES.EDIT_MODE);
            
    //         edbtn = cmpel.querySelector("#ec-edit-btn")     
    //         discbtn = cmpel.querySelector("#ec-discard-btn")
    //         donebtn = cmpel.querySelector("#ec-close-btn")  
    //         prevubtn = cmpel.querySelector("#ec-preview-btn")  
    //         expect(prevubtn.disabled).toBeFalsy();
    //         expect(donebtn.disabled).toBeFalsy();
    //         expect(discbtn.disabled).toBeFalsy();
    //         expect(edbtn).toBeNull();
    //     });

    // }));

    // test discardEdits()
    // it('discardEdits()', waitForAsync(() => {
    //     let cmpel = fixture.nativeElement;
    //     let edbtn = cmpel.querySelector("#ec-edit-btn") 

    //     component.startEditing();
    //     fixture.whenStable().then(() => {
    //         fixture.detectChanges();
    //         expect(component._editMode).toBe(EDIT_MODES.EDIT_MODE);
            
    //         edbtn = cmpel.querySelector("#ec-edit-btn")     
    //         expect(edbtn).toBeNull();

    //         component.discardEdits();
    //         fixture.whenStable().then(() => {
    //             fixture.detectChanges();
    //             expect(component._editMode).toBe(EDIT_MODES.PREVIEW_MODE);
                
    //             edbtn = cmpel.querySelector("#ec-edit-btn")     
    //             let discbtn = cmpel.querySelector("#ec-discard-btn") 
    //             let donebtn = cmpel.querySelector("#ec-close-btn") 
    //             let prevubtn = cmpel.querySelector("#ec-preview-btn")
                
    //             expect(prevubtn).toBeNull();
    //             expect(edbtn.disabled).toBeFalsy();
    //             expect(donebtn.disabled).toBeFalsy();
    //             expect(discbtn.disabled).toBeFalsy();
    //         });
    //     });
    // }));

    // test doneEdits
    // it('doneEdits()', waitForAsync(() => {
    //     expect(component._editMode).toBe(EDIT_MODES.VIEWONLY_MODE);
    //     let cmpel = fixture.nativeElement;
    //     let edbtn = cmpel.querySelector("#ec-edit-btn") 

    //     component.startEditing();
    //     fixture.whenStable().then(() => {
    //         fixture.detectChanges();
    //         expect(component._editMode).toBe(EDIT_MODES.EDIT_MODE);
            
    //         edbtn = cmpel.querySelector("#ec-edit-btn")     
    //         expect(edbtn).toBeNull();

            // component.doneEdits();
            // fixture.whenStable().then(() => {
            //     fixture.detectChanges();
            //     expect(component._editMode).toBe(EDIT_MODES.DONE_MODE);
                
            //     edbtn = cmpel.querySelector("#ec-edit-btn")     
            //     let discbtn = cmpel.querySelector("#ec-discard-btn") 
            //     let donebtn = cmpel.querySelector("#ec-close-btn") 
            //     let prevubtn = cmpel.querySelector("#ec-preview-btn")
                
            //     expect(prevubtn).toBeNull();
            //     expect(edbtn).toBeNull();
            //     expect(donebtn.disabled).toBeTruthy();
            //     expect(discbtn.disabled).toBeTruthy();
            // });
    //     });
    // }));

    // it('sends md update', () => {
    //     let md = null;
    //     component.mdrecChange.subscribe((ev) => {
    //         md = ev;
    //     });
    //     expect(md).toBeNull();
    //     component.startEditing();
    //     expect(md).not.toBeNull();

    //     md = null;
    //     component.discardEdits();
    //     expect(md).not.toBeNull();
    // });
});

