import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { ResourceRefsComponent } from './resourcerefs.component';
import { NerdmRes } from '../../nerdm/nerdm';
import { testdata } from '../../../environments/environment';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { Component } from '@angular/core';
import { RefMidasComponent } from '../references/ref-midas/ref-midas.component';
import { RefPubComponent } from '../references/ref-pub/ref-pub.component';

describe('ResourceRefsComponent', () => {
    let component: ResourceRefsComponent;
    let fixture: ComponentFixture<ResourceRefsComponent>;
    let rec : NerdmRes = testdata['test1'];

    let makeComp = function() {
        @Component({
            selector: "lib-section-title",
            standalone: true,
            template: `<div></div>`,
        })
        class TestSectionTitleComponent {}

        @Component({
            selector: "ref-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestRefPubComponent {}

        @Component({
            selector: "ref-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestRefMidasComponent {}

        TestBed.overrideComponent(ResourceRefsComponent, {
            add: {
                imports: [
                    TestSectionTitleComponent,
                    TestRefPubComponent,
                    TestRefMidasComponent
                ],
            },
            remove: {
                imports: [
                    SectionTitleComponent,
                    RefPubComponent,
                    RefMidasComponent
                ],
            },
        });

        fixture = TestBed.createComponent(ResourceRefsComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
