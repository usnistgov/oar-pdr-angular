import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoftwareinfoComponent } from './softwareinfo.component';
import { StepModel } from "../../models/step.model";
import { DataModel } from '../../models/data.model';
import { StepService } from '../../services/step.service';

describe('SoftwareinfoComponent', () => {
    let component: SoftwareinfoComponent;
    let fixture: ComponentFixture<SoftwareinfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ SoftwareinfoComponent ],
            providers: [ 
                StepService
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoftwareinfoComponent);
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
