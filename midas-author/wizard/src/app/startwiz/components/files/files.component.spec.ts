import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesComponent } from './files.component';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

describe('FilesComponent', () => {
    let component: FilesComponent;
    let fixture: ComponentFixture<FilesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ FilesComponent ],
            providers: [ 
                StepService
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilesComponent);
        component = fixture.componentInstance;
        component.dataModel = {} as DataModel;
        component.steps = [
            new StepModel(1, 'Publication Type',true,true,false,false),
            new StepModel(2, 'Contact Info',true,false),
            new StepModel(3, 'Files',true,false),
            new StepModel(4, 'Software',false,false),
            new StepModel(5, 'Associated Papers',true,false),
            new StepModel(6, 'Name',true,false),
            new StepModel(7, 'Collection',false,false)
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
