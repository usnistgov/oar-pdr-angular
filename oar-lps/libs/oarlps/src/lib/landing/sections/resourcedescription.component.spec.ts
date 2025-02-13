import { ComponentFixture, TestBed, ComponentFixtureAutoDetect, waitForAsync  } from '@angular/core/testing';
import { NerdmRes } from '../../nerdm/nerdm';
import { ResourceDescriptionComponent } from './resourcedescription.component';
import { testdata } from '../../../environments/environment';
import { Component } from '@angular/core';
import { DescriptionComponent } from '../description/description.component';
import { TopicComponent } from '../topic/topic.component';
import { KeywordComponent } from '../keyword/keyword.component';
import { TopicPubComponent } from '../topic/topic-pub/topic-pub.component';
import { SectionTitleComponent } from '../section-title/section-title.component';

describe('ResourceDescriptionComponent', () => {
    let component : ResourceDescriptionComponent;
    let fixture : ComponentFixture<ResourceDescriptionComponent>;
    let rec : NerdmRes = testdata['test1'];

    let makeComp = function() {
        @Component({
            selector: "lib-section-title",
            standalone: true,
            template: `<div></div>`,
        })
        class TestSectionTitleComponent {}

        @Component({
            selector: "app-description",
            standalone: true,
            template: `<div></div>`,
        })
        class TestDescriptionComponent {}

        @Component({
            selector: "app-topic",
            standalone: true,
            template: `<div></div>`,
        })
        class TestTopicComponent {}

        @Component({
            selector: "app-keyword",
            standalone: true,
            template: `<div></div>`,
        })
        class TestKeywordComponent {}

        @Component({
            selector: "topic-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestTopicPubComponent {}

        TestBed.overrideComponent(ResourceDescriptionComponent, {
            add: {
                imports: [
                    TestSectionTitleComponent,
                    TestDescriptionComponent,
                    TestTopicComponent,
                    TestKeywordComponent,
                    TestTopicPubComponent
                ],
            },
            remove: {
                imports: [
                    SectionTitleComponent,
                    DescriptionComponent,
                    TopicComponent,
                    KeywordComponent,
                    TopicPubComponent
                ],
            },
        });

        fixture = TestBed.createComponent(ResourceDescriptionComponent);
        component = fixture.componentInstance;
        component.record = JSON.parse(JSON.stringify(rec));
        // fixture.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        makeComp();
        component.inBrowser = true;
        fixture.detectChanges();
    }));

    it('should initialize', () => {
        expect(component).toBeDefined();
    });

    it('isDataPublication', () => {
        expect(component).toBeDefined();
        expect(component.isDataPublication()).toBeFalsy();
        let cmpel = fixture.nativeElement;
        
        component.record['@type'].push("nrdp:DataPublication");
        expect(component.isDataPublication()).toBeTruthy();
    });
})
