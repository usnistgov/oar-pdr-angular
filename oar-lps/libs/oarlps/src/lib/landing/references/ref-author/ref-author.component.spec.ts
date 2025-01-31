import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RefAuthorComponent } from './ref-author.component';

describe('RefAuthorComponent', () => {
  let component: RefAuthorComponent;
  let fixture: ComponentFixture<RefAuthorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RefAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
