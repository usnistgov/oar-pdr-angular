import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RefPubComponent } from './ref-pub.component';

describe('RefPubComponent', () => {
    let component: RefPubComponent;
    let fixture: ComponentFixture<RefPubComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RefPubComponent]
        })
        .compileComponents();

        let record: any = require('../../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(RefPubComponent);
        component = fixture.componentInstance;
        component.record = record;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize', () => {
        // has 2 references
        let cmpel = fixture.nativeElement;
        let els = cmpel.querySelectorAll("a")
        expect(els.length).toBe(2);
    });

    // it('should suppress for empty list', () => {
    //     expect(component).toBeTruthy();
    //     component.record['references'] = [];
    //     fixture.detectChanges();

    //     let cmpel = fixture.nativeElement;
    //     expect(cmpel.querySelectorAll(".reference-text")).toBeTruthy();
    //     let els = cmpel.querySelectorAll("a")
    //     expect(els.length).toBe(0);
    // });

    it('should not render ref as a link without location', () => {
        // remove the locations from the two reference
        component.record['references'][0].location = null;
        delete component.record['references'][1].location;
        fixture.detectChanges();

        expect(component).toBeTruthy();
        let cmpel = fixture.nativeElement;
        let reflist = cmpel.querySelectorAll(".reference-text");
        expect(reflist).toBeTruthy();

        // has 2 references
        let els = cmpel.querySelectorAll(".ref-entry")
        expect(els.length).toBe(2);
        els = cmpel.querySelectorAll("a");
        expect(els.length).toBe(0);
    });
});
