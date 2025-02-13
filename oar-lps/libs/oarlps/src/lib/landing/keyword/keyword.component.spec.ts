import { ComponentFixture, TestBed, fakeAsync  } from '@angular/core/testing';
import { KeywordComponent } from './keyword.component';
import { KeywordPubComponent } from './keyword-pub/keyword-pub.component';
import { KeywordMidasComponent } from './keyword-midas/keyword-midas.component';
import { Component } from '@angular/core';

describe('KeywordComponent', () => {
    let component: KeywordComponent;
    let fixture: ComponentFixture<KeywordComponent>;

    beforeEach(() => {
        @Component({
            selector: "keyword-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestKeywordPubComponent {}

        @Component({
            selector: "keyword-midas",
            standalone: true,
            template: `<div></div>`,
        })
        class TestKeywordMidasComponent {}

        TestBed.overrideComponent(KeywordComponent, {
            add: {
                imports: [
                    TestKeywordPubComponent,
                    TestKeywordMidasComponent
                ],
            },
            remove: {
                imports: [
                    KeywordPubComponent,
                    KeywordMidasComponent
                ],
            },
        });
    });

    beforeEach(() => {
        let record: any = require('../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(KeywordComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Subject Keywords should Wireless', () => {
        let cmpel = fixture.nativeElement;

        fakeAsync(() => {
            let aels = cmpel.querySelectorAll(".keywords");
            expect(aels.length).toEqual(5);
            expect(aels[0].innerText).toContain('IoT');
            expect(aels[1].innerText).toContain('Wireless');
            expect(aels[2].innerText).toContain('RF');
            expect(aels[3].innerText).toContain('Manufacturing');
            expect(aels[4].innerText).toContain('Node.js');
        });
    });
});
