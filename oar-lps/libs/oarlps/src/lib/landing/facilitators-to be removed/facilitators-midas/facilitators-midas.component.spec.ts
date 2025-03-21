import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitatorsMidasComponent } from './facilitators-midas.component';

describe('FacilitatorsMidasComponent', () => {
  let component: FacilitatorsMidasComponent;
  let fixture: ComponentFixture<FacilitatorsMidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitatorsMidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilitatorsMidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
