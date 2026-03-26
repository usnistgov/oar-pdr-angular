import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionService } from '../../../shared/collection-service/collection.service';
import { CitationPopupComponent } from './citation-popup.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('CitationPopupComponent', () => {
    let component: CitationPopupComponent;
    let fixture: ComponentFixture<CitationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [
                CitationPopupComponent,
                FontAwesomeTestingModule,
                NoopAnimationsModule],
            providers: [
                NgbActiveModal,
                provideHttpClient(),
                provideHttpClientTesting(),
                CollectionService]
        })
        .compileComponents();

        fixture = TestBed.createComponent(CitationPopupComponent);
        component = fixture.componentInstance;
        component.citetext = "It's all about me!";
        component.visible = true;
        component.allCollections =
            {
                "NIST": {
                    "tag": "NIST R&D",
                    "bannerUrl": "",
                    "id":"",
                    "taxonomyURI": "https://data.nist.gov/od/dm/nist-themes/",
                    "colorPalette": "Green",
                    "displayOrder": 4,
                    "landingPage": true
                },
                "Forensics": {
                    "tag": "Forensics",
                    "bannerUrl": "assets/images/fingerprint.jpg",
                    "id":"pdr0-0001",
                    "taxonomyURI": "https://data.nist.gov/od/dm/nist-themes-forensics/",
                    "colorPalette": "Cyan",
                    "displayOrder": 2,
                    "landingPage": true
                },
                "Semiconductors": {
                    "tag": "CHIPS Metrology",
                    "bannerUrl": "assets/images/METIS-Banner-Op1.png",
                    "id":"pdr0-0002",
                    "taxonomyURI": "https://data.nist.gov/od/dm/nist-themes-chipsmetrology/",
                    "colorPalette": "Blue",
                    "displayOrder": 1,
                    "landingPage": true
                },
                "AM": {
                    "tag": "Additive Manufacturing",
                    "bannerUrl": "assets/images/AM_Banner3.jpg",
                    "id":"pdr0-0003",
                    "taxonomyURI": "https://data.nist.gov/od/dm/nist-themes-additivemanufacturing/",
                    "colorPalette": "AMGreen",
                    "displayOrder": 3,
                    "landingPage": true
                }      
            }
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
