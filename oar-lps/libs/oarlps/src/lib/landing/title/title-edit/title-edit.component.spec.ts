import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleEditComponent } from './title-edit.component';

describe('TitleEditComponent', () => {
  let component: TitleEditComponent;
  let fixture: ComponentFixture<TitleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
