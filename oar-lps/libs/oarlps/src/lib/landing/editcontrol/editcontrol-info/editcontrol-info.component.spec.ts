import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditcontrolInfoComponent } from './editcontrol-info.component';

describe('EditcontrolInfoComponent', () => {
  let component: EditcontrolInfoComponent;
  let fixture: ComponentFixture<EditcontrolInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditcontrolInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditcontrolInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
