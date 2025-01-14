import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisithpmeMidasComponent } from './visithpme-midas.component';

describe('VisithpmeMidasComponent', () => {
  let component: VisithpmeMidasComponent;
  let fixture: ComponentFixture<VisithpmeMidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisithpmeMidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisithpmeMidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
