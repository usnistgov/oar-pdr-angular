import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { DescriptionComponent } from './description.component';
import { Component } from '@angular/core';
import { DescEditComponent } from './desc-edit/desc-edit.component';

describe('DescriptionComponent', () => {
    let component: DescriptionComponent;
    let fixture: ComponentFixture<DescriptionComponent>;

    beforeEach(waitForAsync(() => {
        @Component({
            selector: "contact-pub",
            standalone: true,
            template: `<div></div>`,
        })
        class TestDescEditComponent {}

        TestBed.overrideComponent(DescriptionComponent, {
            add: {
                imports: [
                    TestDescEditComponent
                ],
            },
            remove: {
                imports: [
                    DescEditComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DescriptionComponent);
        component = fixture.componentInstance;
        component.record = require('../../../assets/sampleRecord.json');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
