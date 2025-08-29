import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationPopupComponent } from './citation-popup.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('CitationPopupComponent', () => {
    let component: CitationPopupComponent;
    let fixture: ComponentFixture<CitationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [
            CitationPopupComponent,
                NoopAnimationsModule],
        providers: [NgbActiveModal]
        })
        .compileComponents();

        fixture = TestBed.createComponent(CitationPopupComponent);
        component = fixture.componentInstance;
        component.citetext = "It's all about me!";
        component.visible = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();

        let cmpel = fixture.nativeElement;
        let pels = cmpel.querySelectorAll("button");
        expect(pels.length).toEqual(1);

        pels = cmpel.querySelectorAll(".citation");
        expect(pels.length).toEqual(1);
        expect(pels[0].textContent).toEqual("It's all about me!");

        pels = cmpel.querySelectorAll("a");
        expect(pels.length).toEqual(1);
        expect(pels[0].textContent).toContain("Recommendations");
    });
});
