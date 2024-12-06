import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTitleComponent } from './section-title.component';
import { GlobalService } from '../../shared/globals/globals'
import { D3Service } from '../../shared/d3-service/d3.service';
import { CollectionService } from '../../shared/collection-service/collection.service';

describe('SectionTitleComponent', () => {
  let component: SectionTitleComponent;
  let fixture: ComponentFixture<SectionTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SectionTitleComponent],
      providers: [ GlobalService, CollectionService, D3Service ]
    });
      let gs = TestBed.inject(GlobalService);
      let cs = TestBed.inject(CollectionService);
      let d3s = TestBed.inject(D3Service);
    fixture = TestBed.createComponent(SectionTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
