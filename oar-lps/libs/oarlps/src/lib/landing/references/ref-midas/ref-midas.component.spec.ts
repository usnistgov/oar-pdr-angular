import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefMidasComponent } from './ref-midas.component';

describe('RefMidasComponent', () => {
  let component: RefMidasComponent;
  let fixture: ComponentFixture<RefMidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefMidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefMidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
