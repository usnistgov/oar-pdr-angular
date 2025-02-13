import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { AuthorComponent } from './author.component';
import { testdata } from '../../../environments/environment';
import { Component } from '@angular/core';
import { AuthorPubComponent } from './author-pub/author-pub.component';
import { AuthorMidasComponent } from './author-midas/author-midas.component';

describe('AuthorComponent', () => {
    let component: AuthorComponent;
    let fixture: ComponentFixture<AuthorComponent>;
    let rec = testdata['test2'];

    beforeEach(waitForAsync(() => {
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

        TestBed.overrideComponent(AuthorComponent, {
            add: {
                imports: [
                    TestAuthorPubComponent,
                    TestAuthorMidasComponent
                ],
            },
            remove: {
                imports: [
                    AuthorPubComponent,
                    AuthorMidasComponent
                ],
            },
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthorComponent);
        component = fixture.componentInstance;
        component.record = rec;
        component.isEditMode = false;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
