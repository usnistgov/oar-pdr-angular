import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssociatedPapersComponent } from './associated-papers.component';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { DataModel } from '../../models/data.model';

describe('AssociatedPapersComponent', () => {
    let component: AssociatedPapersComponent;
    let fixture: ComponentFixture<AssociatedPapersComponent>;

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
            declarations: [ AssociatedPapersComponent ],
            providers: [ 
                FormGroupDirective,
                FormBuilder,
                {provide: FormGroupDirective, useValue: formGroupDirective}
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssociatedPapersComponent);
        component = fixture.componentInstance;
        component.dataModel = {} as DataModel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
