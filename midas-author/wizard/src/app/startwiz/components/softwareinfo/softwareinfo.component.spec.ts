import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoftwareinfoComponent } from './softwareinfo.component';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { DataModel } from '../../models/data.model';

describe('SoftwareinfoComponent', () => {
    let component: SoftwareinfoComponent;
    let fixture: ComponentFixture<SoftwareinfoComponent>;

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
            declarations: [ SoftwareinfoComponent ],
            providers: [ 
                FormGroupDirective,
                FormBuilder,
                {provide: FormGroupDirective, useValue: formGroupDirective}
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoftwareinfoComponent);
        component = fixture.componentInstance;
        component.dataModel = {} as DataModel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
