import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleMsgBarComponent } from './single-msg-bar.component';

describe('SingleMsgBarComponent', () => {
  let component: SingleMsgBarComponent;
  let fixture: ComponentFixture<SingleMsgBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleMsgBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleMsgBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
