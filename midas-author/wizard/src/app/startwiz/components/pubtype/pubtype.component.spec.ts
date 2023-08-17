import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PubtypeComponent } from './pubtype.component';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { DataModel } from '../../models/data.model';

describe('PubtypeComponent', () => {
    let component: PubtypeComponent;
    let fixture: ComponentFixture<PubtypeComponent>;

    beforeEach(async () => {
        const fb = new FormBuilder()

        const formGroupDirective = new FormGroupDirective([], []);
        formGroupDirective.form = fb.group({
            'pubtype': fb.group({
                resourceType: [""]
            }),
            'softwareInfo': fb.group({
                provideLink: [false],
                softwareLink: [""]
            }),
            'contactInfo': fb.group({
                creatorIsContact: [true],
                contactName: [""]
            }),
            'files': fb.group({
                willUpload: [true]
            }),
            'assocPapers': fb.group({
                assocPageType: [""]
            })
        });

        await TestBed.configureTestingModule({
            declarations: [ PubtypeComponent ],
            providers: [ 
                FormGroupDirective,
                FormBuilder,
                {provide: FormGroupDirective, useValue: formGroupDirective}
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PubtypeComponent);
        component = fixture.componentInstance;
        component.dataModel = {} as DataModel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
