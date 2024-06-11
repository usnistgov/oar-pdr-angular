import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CollectionComponent } from './collection.component';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ StepService ],
        declarations: [ CollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionComponent);
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
