import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { ResourceRefsComponent } from './resourcerefs.component';
import { NerdmRes } from '../../nerdm/nerdm';
import { testdata } from '../../../environments/environment';
import { ReferencesComponent } from '../references/references.component';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { Component } from '@angular/core';

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
            selector: "app-references",
            standalone: true,
            template: `<div></div>`,
        })
        class TestReferencesComponent {}

        TestBed.overrideComponent(ResourceRefsComponent, {
            add: {
                imports: [
                    TestSectionTitleComponent,
                    TestReferencesComponent
                ],
            },
            remove: {
                imports: [
                    SectionTitleComponent,
                    ReferencesComponent
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
