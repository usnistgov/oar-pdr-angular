import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefAuthorComponent } from './ref-author.component';

describe('RefAuthorComponent', () => {
  let component: RefAuthorComponent;
  let fixture: ComponentFixture<RefAuthorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefAuthorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
