import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencesPopupComponent } from './references-popup.component';

describe('ReferencesPopupComponent', () => {
  let component: ReferencesPopupComponent;
  let fixture: ComponentFixture<ReferencesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferencesPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
