import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorPubComponent } from './author-pub.component';

describe('AuthorPubComponent', () => {
  let component: AuthorPubComponent;
  let fixture: ComponentFixture<AuthorPubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorPubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
