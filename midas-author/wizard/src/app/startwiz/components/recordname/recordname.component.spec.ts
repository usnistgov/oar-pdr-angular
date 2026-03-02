import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordNameComponent } from './recordname.component';
import { StepService } from '../../services/step.service';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { WizardService } from '../../services/wizard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RecordNameComponent', () => {
  let component: RecordNameComponent;
  let fixture: ComponentFixture<RecordNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [RecordNameComponent],
        imports: [HttpClientTestingModule],
        providers: [ 
            StepService,
            WizardService
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordNameComponent);
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
    component.wizardService.setCred({
        token: "fake-token",
        userId: "id",
        userAttributes: {}
    });
      
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
