import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { LandingBodyComponent } from './landingbody.component';
import { NerdmRes } from 'oarlps';
import * as environment from '../../../environments/environment';
import { MetricsData } from "../metrics-data";
import { Component } from '@angular/core';
import { ResourceIdentityComponent } from '../sections/resourceidentity.component';
import { ResourceDataComponent } from '../sections/resourcedata.component';
import { ResourceDescriptionComponent } from '../sections/resourcedescription.component';
import { ResourceMetadataComponent } from '../sections/resourcemetadata.component';
import { ResourceRefsComponent } from '../sections/resourcerefs.component';

describe('LandingBodyComponent', () => {
    @Component({
        selector: "pdr-resource-id",
        standalone: true,
        template: `<div></div>`,
    })
    class TestResourceIdentityComponent {}

    @Component({
        selector: "pdr-resource-data",
        standalone: true,
        template: `<div></div>`,
    })
    class TestResourceDataComponent {}
      
    @Component({
        selector: "pdr-resource-desc",
        standalone: true,
        template: `<div></div>`,
    })
    class TestResourceDescriptionComponent {}

    @Component({
        selector: "pdr-resource-md",
        standalone: true,
        template: `<div></div>`,
    })
    class TestResourceMetadataComponent {}

    @Component({
        selector: "pdr-resource-refs",
        standalone: true,
        template: `<div></div>`,
    })
    class TestResourceRefsComponent {}

    let component: LandingBodyComponent;
    let fixture: ComponentFixture<LandingBodyComponent>;
    let record1 : NerdmRes = environment.testdata['test1'];

    let makeComp = function() {

        TestBed.overrideComponent(LandingBodyComponent, {
            add: {
                imports: [
                    TestResourceIdentityComponent,
                    TestResourceDataComponent,
                    TestResourceDescriptionComponent,
                    TestResourceMetadataComponent,
                    TestResourceRefsComponent
                ],
            },
            remove: {
                imports: [
                    ResourceIdentityComponent,
                    ResourceDataComponent,
                    ResourceDescriptionComponent,
                    ResourceMetadataComponent,
                    ResourceRefsComponent
                ],
            },
        });

        fixture = TestBed.createComponent(LandingBodyComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.mobileMode = false;
        component.md = JSON.parse(JSON.stringify(record1));
        component.md["@type"][0] = "nrdp:PublicDataResource";
        component.metricsData = new MetricsData();
        component.editEnabled = false;
        component.landingPageURL = "testURL";
        component.landingPageServiceStr = "serviceURL";

        fixture.detectChanges();
    }));

    it('should create', () => {
        debugger;
      expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        fakeAsync(() => {
            expect(component).toBeTruthy();
            let cmpel = fixture.nativeElement;
            expect(cmpel.querySelector("#resourcebody")).toBeTruthy();

            let sect = cmpel.querySelector("#identity");
            expect(sect).toBeTruthy();
            let title = sect.querySelector("h2");
            expect(title).toBeTruthy();
            expect(title.textContent).toContain("MEDS-I")

            sect = cmpel.querySelector("#description")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("Description");

            sect = cmpel.querySelector("#dataAccess")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("Data Access");

            sect = cmpel.querySelector("#references")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("References");

            sect = cmpel.querySelector("#about")
            expect(sect).toBeTruthy();
            title = sect.querySelector("h3");
            expect(title).toBeTruthy();
            expect(title.textContent).toEqual("About This Dataset");
        });
    });
});

