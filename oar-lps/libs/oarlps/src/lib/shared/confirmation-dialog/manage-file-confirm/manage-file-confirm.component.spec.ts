import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFileConfirmComponent } from './manage-file-confirm.component';

describe('ManageFileConfirmComponent', () => {
  let component: ManageFileConfirmComponent;
  let fixture: ComponentFixture<ManageFileConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFileConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFileConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
