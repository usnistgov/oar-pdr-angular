import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorEditComponent } from './author-edit.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthorEditComponent', () => {
  let component: AuthorEditComponent;
  let fixture: ComponentFixture<AuthorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorEditComponent ],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
