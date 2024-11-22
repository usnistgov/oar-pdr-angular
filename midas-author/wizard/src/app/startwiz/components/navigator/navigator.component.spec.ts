import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepService } from '../../services/step.service';
import { NavigatorComponent } from './navigator.component';
import { StepModel } from "../../models/step.model";

describe('NavigatorComponent', () => {
  let component: NavigatorComponent;
  let fixture: ComponentFixture<NavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigatorComponent ],
      providers: [ StepService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigatorComponent);
    component = fixture.componentInstance;
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
