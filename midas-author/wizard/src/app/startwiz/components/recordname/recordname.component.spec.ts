import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordNameComponent } from './recordname.component';

describe('RecordNameComponent', () => {
  let component: RecordNameComponent;
  let fixture: ComponentFixture<RecordNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordNameComponent ]
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
