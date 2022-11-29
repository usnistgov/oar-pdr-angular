import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleApageComponent } from './single-apage.component';

describe('SingleApageComponent', () => {
  let component: SingleApageComponent;
  let fixture: ComponentFixture<SingleApageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleApageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleApageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
