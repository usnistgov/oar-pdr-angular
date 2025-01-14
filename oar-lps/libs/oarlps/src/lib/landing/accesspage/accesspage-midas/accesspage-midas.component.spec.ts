import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesspageMidasComponent } from './accesspage-midas.component';

describe('AccesspageMidasComponent', () => {
  let component: AccesspageMidasComponent;
  let fixture: ComponentFixture<AccesspageMidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesspageMidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesspageMidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
