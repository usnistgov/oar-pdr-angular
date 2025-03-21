import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationDisplayComponent } from './citation-display.component';

describe('CitationDisplayComponent', () => {
  let component: CitationDisplayComponent;
  let fixture: ComponentFixture<CitationDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitationDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitationDisplayComponent);
    component = fixture.componentInstance;
    component.citetext = "It's all about me!";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    let cmpel = fixture.nativeElement;
    let pels = cmpel.querySelectorAll(".citation");
    expect(pels.length).toEqual(1);
    expect(pels[0].textContent).toEqual("It's all about me!");

    pels = cmpel.querySelectorAll("a");
    expect(pels.length).toEqual(1);
    expect(pels[0].textContent).toContain("Recommendations");

  });
});
