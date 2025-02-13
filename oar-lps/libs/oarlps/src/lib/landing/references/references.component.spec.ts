import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReferencesComponent } from './references.component';
import { Component } from '@angular/core';
import { testdata } from '../../../environments/environment';
import { NerdmRes } from '../../nerdm/nerdm';
import { RefMidasComponent } from './ref-midas/ref-midas.component';
import { RefPubComponent } from './ref-pub/ref-pub.component';

describe('ReferencesComponent', () => {
    let component: ReferencesComponent;
    let fixture: ComponentFixture<ReferencesComponent>;
    let rec : NerdmRes = testdata['test1'];

    beforeEach(waitForAsync(() => {
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

        TestBed.overrideComponent(ReferencesComponent, {
            add: {
                imports: [
                    TestRefPubComponent,
                    TestRefMidasComponent
                ],
            },
            remove: {
                imports: [
                    RefPubComponent,
                    RefMidasComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferencesComponent);
        component = fixture.componentInstance;
        component.record = JSON.parse(JSON.stringify(rec));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
