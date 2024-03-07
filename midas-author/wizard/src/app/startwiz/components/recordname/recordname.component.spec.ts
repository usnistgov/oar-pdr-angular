import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { RecordNameComponent } from './recordname.component';

describe('RecordNameComponent', () => {
  let component: RecordNameComponent;
  let fixture: ComponentFixture<RecordNameComponent>;

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
        }),
        'recordname': fb.group({
            recordname: [""]
        })
    });

    await TestBed.configureTestingModule({
        declarations: [ RecordNameComponent ],
        providers: [ 
            FormGroupDirective,
            FormBuilder,
            {provide: FormGroupDirective, useValue: formGroupDirective}
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
