import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testdata } from '../../../../environments/environment';
import { FacilitatorsPubComponent } from './facilitators-pub.component';

describe('FacilitatorsPubComponent', () => {
    let component: FacilitatorsPubComponent;
    let fixture: ComponentFixture<FacilitatorsPubComponent>;
    let rec = testdata['test2'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [FacilitatorsPubComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(FacilitatorsPubComponent);
        component = fixture.componentInstance;
        component.record = rec;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
