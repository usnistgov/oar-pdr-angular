import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RefAuthorComponent } from './ref-author.component';
import { TextEditComponent } from '../../../text-edit/text-edit.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

describe('RefAuthorComponent', () => {
  let component: RefAuthorComponent;
  let fixture: ComponentFixture<RefAuthorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RefAuthorComponent,
        CommonModule,
        TextEditComponent,
        DragDropModule,
        NoopAnimationsModule
      ]
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
