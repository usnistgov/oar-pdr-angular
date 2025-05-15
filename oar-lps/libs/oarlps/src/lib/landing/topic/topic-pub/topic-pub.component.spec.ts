import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPubComponent } from './topic-pub.component';

describe('TopicPubComponent', () => {
    let component: TopicPubComponent;
    let fixture: ComponentFixture<TopicPubComponent>;
    let record: any = require('../../../../assets/sampleRecord.json');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [TopicPubComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(TopicPubComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
