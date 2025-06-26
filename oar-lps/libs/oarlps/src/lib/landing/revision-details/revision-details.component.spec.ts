import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionDetailsComponent } from './revision-details.component';

describe('RevisionDetailsComponent', () => {
  let component: RevisionDetailsComponent;
  let fixture: ComponentFixture<RevisionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
