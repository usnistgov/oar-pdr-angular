import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VisithomeComponent } from './visithome.component';
import { Component } from '@angular/core';
import { VisithomePubComponent } from './visithome-pub/visithome-pub.component';
import { VisithomeMidasComponent } from './visithome-midas/visithome-midas.component';

describe('VisithomeComponent', () => {
    let component: VisithomeComponent;
    let fixture: ComponentFixture<VisithomeComponent>;

    beforeEach(waitForAsync(() => {
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

        TestBed.overrideComponent(VisithomeComponent, {
            add: {
                imports: [
                    TestVisithomePubComponent,
                    TestVisithomeMidasComponent
                ],
            },
            remove: {
                imports: [
                    VisithomePubComponent,
                    VisithomeMidasComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisithomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
