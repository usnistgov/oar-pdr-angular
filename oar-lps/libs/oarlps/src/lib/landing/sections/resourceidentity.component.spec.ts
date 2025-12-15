import { ComponentFixture, TestBed, fakeAsync, waitForAsync  } from '@angular/core/testing';
import { NerdmRes } from '../../nerdm/nerdm';
import { ResourceIdentityComponent } from './resourceidentity.component';
import { testdata } from '../../../environments/environment';
import * as _ from 'lodash-es';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TitleComponent } from '../title/title.component';
import { IspartofComponent } from '../ispartof/ispartof.component';
import { FacilitatorsComponent } from '../facilitators-to be removed/facilitators.component';
import { ContactPubComponent } from '../contact/contact-pub/contact-pub.component';
import { ContactMidasComponent } from '../contact/contact-midas/contact-midas.component';
import { AuthorPubComponent } from '../author/author-pub/author-pub.component';
import { AuthorMidasComponent } from '../author/author-midas/author-midas.component';
import { VisithomePubComponent } from '../visithome/visithome-pub/visithome-pub.component';
import { VisithomeMidasComponent } from '../visithome/visithome-midas/visithome-midas.component';

describe('ResourceIdentityComponent', () => {

    let component : ResourceIdentityComponent;
    let fixture : ComponentFixture<ResourceIdentityComponent>;
    let rec : NerdmRes = testdata['test1'];

    let makeComp = function() {
        @Component({
            selector: "lib-section-title",
            standalone: true,
            template: `<div></div>`,
        })
        class TestTitleComponent {}

        @Component({
            selector: "app-ispartof",
            standalone: true,
            template: `<div></div>`,
        })
        class TestIspartofComponent {}

        @Component({
            selector: "author-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestAuthorPubComponent {}

        @Component({
            selector: "author-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestAuthorMidasComponent {}

        @Component({
            selector: "contact-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestContactPubComponent {}

        @Component({
            selector: "contact-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestContactMidasComponent {}

        @Component({
            selector: "Visithome-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestVisithomePubComponent {}

        @Component({
            selector: "Visithome-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestVisithomeMidasComponent {}

        TestBed.overrideComponent(ResourceIdentityComponent, {
            add: {
                imports: [
                    TestTitleComponent,
                    TestIspartofComponent,
                    TestAuthorPubComponent,
                    TestAuthorMidasComponent,
                    TestVisithomePubComponent,
                    TestVisithomeMidasComponent,
                    TestContactPubComponent,
                    TestContactMidasComponent
                ],
            },
            remove: {
                imports: [
                    TitleComponent,
                    IspartofComponent,
                    ContactPubComponent,
                    ContactMidasComponent,
                    VisithomePubComponent,
                    VisithomeMidasComponent,
                    AuthorPubComponent,
                    AuthorMidasComponent
                ],
            },
        });

        // let httpMock = TestBed.inject(HttpTestingController);
        // let req = httpMock.expectOne('assets/config.json');

        // req.flush({
        //     staffdir: {
        //         serviceEndpoint: svcep
        //     }
        // });

        fixture = TestBed.createComponent(ResourceIdentityComponent);
        component = fixture.componentInstance;
        rec["@type"][0] = "nrdp:PublicDataResource";
        rec["references"][0]["refType"] = "IsDocumentedBy";
        component.record = rec;
        // fixture.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        providers: [
            GoogleAnalyticsService
        ]})
        .compileComponents();

        makeComp();
        component.inBrowser = true;
        component.ngOnChanges({})
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        expect(component).toBeDefined();
        let cmpel = fixture.nativeElement;
        
        // let el = cmpel.querySelector("h2"); 
        // expect(el.textContent).toContain(rec.title);

        expect(component.record['version']).toBe("1.0.1");
        // let descs = cmpel.querySelectorAll("p");
        // expect(descs.length).toBe(1);

        // expect(component.versionCmp.newer).toBeNull();

        // test record does not include isPartOf
        fakeAsync(() => {
            let el = cmpel.querySelector("#ispartof");
            expect(el).toBeFalsy();
        });

    });

    it('should correctly render special references', () => {
        expect(component).toBeDefined();
        expect(component.primaryRefs.length).toEqual(1);
        let cmpel = fixture.nativeElement;

        fakeAsync(() => {
            let el = cmpel.querySelector(".describedin")
            expect(el).toBeTruthy();
            expect(el.querySelectorAll(".primary-ref-entry").length).toEqual(1);
            expect(el.querySelectorAll("a").length).toEqual(1);
            el = el.querySelector("a");
            expect(el.textContent).toContain("Solids: In-situ");
        });

        let tstrec = JSON.parse(JSON.stringify(rec));
        delete tstrec['references'][0]['label'];
        component.record = tstrec;
        component.useMetadata();
        expect(component.primaryRefs[0]['label']).toEqual(component.primaryRefs[0]['title']);

        delete tstrec['references'][0]['title'];
        delete tstrec['references'][0]['label'];
        component.record = tstrec;
        component.useMetadata();
        expect(component.primaryRefs[0]['label']).toEqual(component.primaryRefs[0]['citation']);

        delete tstrec['references'][0]['citation'];
        delete tstrec['references'][0]['label'];
        component.record = tstrec;
        component.useMetadata();
        expect(component.primaryRefs[0]['label']).toEqual(component.primaryRefs[0]['location']);
    });

    it('should not render special reference as link without location', () => {
        // remove the location from the special reference
        let tstrec = JSON.parse(JSON.stringify(rec));
        tstrec['references'][0]['location'] = null;
        component.record = tstrec;
        component.useMetadata();
        fixture.detectChanges();
        
        expect(component).toBeDefined();
        expect(component.primaryRefs.length).toEqual(1);
        let cmpel = fixture.nativeElement;

        fakeAsync(() => {
            let el = cmpel.querySelector(".describedin")
            expect(el).toBeTruthy();
            expect(el.querySelectorAll(".primary-ref-entry").length).toEqual(1);
            expect(el.querySelectorAll("a").length).toEqual(0);
        });
    });

    it('should correctly render multiple special references', () => {
        let tstrec = JSON.parse(JSON.stringify(rec));
        tstrec['references'][1]['refType'] = "IsSupplementTo";
        tstrec['references'][1]['location'] = null;
        component.record = tstrec;
        component.useMetadata();
        fixture.detectChanges();
        
        expect(component).toBeDefined();
        expect(component.primaryRefs.length).toEqual(2);
        let cmpel = fixture.nativeElement;

        fakeAsync(() => {
            let el = cmpel.querySelector(".describedin")
            expect(el).toBeTruthy();
            expect(el.querySelectorAll("a").length).toEqual(1);
    //        expect(el.textContent.includes(' ,')).toBeFalsy(); // doesn't work

            let entries = el.querySelectorAll(".primary-ref-entry");
            expect(entries.length).toEqual(2);
            expect(entries[0].querySelectorAll("a").length).toEqual(1);
            expect(entries[1].querySelectorAll("a").length).toEqual(0);
            expect(entries[0].textContent.includes(',')).toBeTruthy();
            expect(entries[1].textContent.includes(',')).toBeFalsy();
            expect(entries[0].textContent.includes(' ,')).toBeFalsy();
        });
    });

    it('should correctly determine resource type', () => {
        expect(component).toBeDefined();
        let cmpel = fixture.nativeElement;
        let member = _.cloneDeep(rec);
        member['isPartOf'] = [
            {
                "@id": "ark:/88888/goobler",
                title: "Uber Research",
                "@type": [ "nrda:ScienceTheme", "nrd:PublicDataResource" ]
            },
            {
                "@id": "ark:/88888/gomer",
                title: "Sleepy Research",
                "@type": [ "nrda:Aggregation", "nrd:PublicDataResource" ]
            }
        ];
        component.record = member;
        component.ngOnChanges({});
        fixture.detectChanges();

        fakeAsync(() => {
            let el = cmpel.querySelector("#ispartof");
            expect(el).toBeTruthy();
            expect(el.querySelector("ul")).toBeFalsy();
            expect(el.innerHTML.includes(" Science Theme")).toBeTruthy();
            let a = el.querySelector("a");
            expect(a).toBeTruthy();
            expect(a.href.endsWith("/ark:/88888/goobler")).toBeTruthy();
        });
    });

});

