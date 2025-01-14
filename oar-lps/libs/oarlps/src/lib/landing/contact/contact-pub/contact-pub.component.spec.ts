import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPubComponent } from './contact-pub.component';

describe('ContactPubComponent', () => {
  let component: ContactPubComponent;
  let fixture: ComponentFixture<ContactPubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
