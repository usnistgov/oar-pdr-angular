import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { ResourceMetadataComponent } from './resourcemetadata.component';
import { NerdmRes } from '../../nerdm/nerdm';
import { testdata } from '../../../environments/environment';
import { MetricsData } from '../metrics-data';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { AboutdatasetComponent } from '../aboutdataset/aboutdataset.component';
import { Component } from '@angular/core';

describe('ResourceMetadataComponent', () => {
    let component: ResourceMetadataComponent;
    let fixture: ComponentFixture<ResourceMetadataComponent>;
    let record : NerdmRes = testdata['test1'];

    let makeComp = function() {
        @Component({
            selector: "lib-section-title",
            standalone: true,
            template: `<div></div>`,
        })
        class TestSectionTitleComponent {}

        @Component({
            selector: "aboutdataset-detail",
            standalone: true,
            template: `<div></div>`,
        })
        class TestAboutdatasetComponent {}

        TestBed.overrideComponent(ResourceMetadataComponent, {
            add: {
                imports: [
                    TestSectionTitleComponent,
                    TestAboutdatasetComponent
                ],
            },
            remove: {
                imports: [
                    SectionTitleComponent,
                    AboutdatasetComponent
                ],
            },
        });

        fixture = TestBed.createComponent(ResourceMetadataComponent);
        component = fixture.componentInstance;
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        component.record = JSON.parse(JSON.stringify(record));
        component.metricsData = new MetricsData();
        component.showJsonViewer = false;
        component.ngOnChanges({});
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;
        expect(cmpel.querySelector("#about")).toBeTruthy();
    });

});
