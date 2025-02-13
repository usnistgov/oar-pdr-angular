import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { ResourceDataComponent } from './resourcedata.component';
import { NerdmRes } from '../../nerdm/nerdm';
import { Themes } from '../../shared/globals/globals';
import { AuthService, MockAuthService } from '../editcontrol/auth.service';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { AccesspageMidasComponent } from '../accesspage/accesspage-midas/accesspage-midas.component';
import { AccesspagePubComponent } from '../accesspage/accesspage-pub/accesspage-pub.component';
import { DataFilesComponent } from '../data-files/data-files.component';
import { Component } from '@angular/core';

describe('ResourceDataComponent', () => {
    let component: ResourceDataComponent;
    let fixture: ComponentFixture<ResourceDataComponent>;
    let rec : NerdmRes = require('../../../assets/sampleRecord.json');
    let authsvc: AuthService = new MockAuthService(undefined);

    let makeComp = function() {
        @Component({
            selector: "lib-section-title",
            standalone: true,
            template: `<div></div>`,
        })
        class TestSectionTitleComponent {}

        @Component({
            selector: "accesspage-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestAccesspageMidasComponent {}

        @Component({
            selector: "accesspage-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestAccesspagePubComponent {}

        @Component({
            selector: "pdr-data-files",
            standalone: true,
            template: `<div></div>`,
        })
        class TestDataFilesComponent {}

        TestBed.overrideComponent(ResourceDataComponent, {
            add: {
                imports: [
                    TestSectionTitleComponent,
                    TestAccesspageMidasComponent,
                    TestAccesspagePubComponent,
                    TestDataFilesComponent
                ],
            },
            remove: {
                imports: [
                    SectionTitleComponent,
                    AccesspageMidasComponent,
                    AccesspagePubComponent,
                    DataFilesComponent
                ],
            },
        });

        fixture = TestBed.createComponent(ResourceDataComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        component.theme = Themes.DEFAULT_THEME;
        component.ngOnChanges({});
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        component.hasRights = true;
        fixture.detectChanges();

        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;

        expect(cmpel.querySelector("#dataAccess")).toBeTruthy();

        // lists access pages
        expect(cmpel.querySelector("#accessPages")).toBeTruthy();

        // shows access rights 
        fakeAsync(() => {
            expect(cmpel.querySelector("#accessRights")).toBeTruthy();
        });

        // lists files - no filelisting in html
        // expect(cmpel.querySelector("#filelisting")).toBeTruthy();
    });
});
