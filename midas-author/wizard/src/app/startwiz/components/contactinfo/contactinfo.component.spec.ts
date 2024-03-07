import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { ContactinfoComponent } from './contactinfo.component';
import { DataModel } from '../../models/data.model';

describe('ContactinfoComponent', () => {
    let component: ContactinfoComponent;
    let fixture: ComponentFixture<ContactinfoComponent>;

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
            declarations: [ ContactinfoComponent ],
            providers: [ 
                FormGroupDirective,
                FormBuilder,
                {provide: FormGroupDirective, useValue: formGroupDirective}
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactinfoComponent);
        component = fixture.componentInstance;
        component.dataModel = {} as DataModel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
