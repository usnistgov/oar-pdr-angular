import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorMidasComponent } from './author-midas.component';

describe('AuthorMidasComponent', () => {
  let component: AuthorMidasComponent;
  let fixture: ComponentFixture<AuthorMidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorMidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorMidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
