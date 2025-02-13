import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { ContactPubComponent } from './contact-pub/contact-pub.component';
import { ContactMidasComponent } from './contact-midas/contact-midas.component';
import { Component } from '@angular/core';

describe('ContactComponent', () => {
    let component: ContactComponent;
    let fixture: ComponentFixture<ContactComponent>;

    beforeEach(waitForAsync(() => {
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

        TestBed.overrideComponent(ContactComponent, {
            add: {
                imports: [
                    TestContactPubComponent,
                    TestContactMidasComponent
                ],
            },
            remove: {
                imports: [
                    ContactPubComponent,
                    ContactMidasComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        let record: any = require('../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(ContactComponent);
        component = fixture.componentInstance;
        component.record = record;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
