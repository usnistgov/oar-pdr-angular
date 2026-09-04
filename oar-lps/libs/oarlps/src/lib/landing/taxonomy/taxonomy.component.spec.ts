import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { TaxonomyComponent } from './taxonomy.component';
import { GlobalService } from '../../shared/globals/globals';
import { TaxonomyListService } from '../../shared/index';
import { SearchfieldsListService } from '../../shared/index';

describe('TaxonomyComponent', () => {
  let component: TaxonomyComponent;
  let fixture: ComponentFixture<TaxonomyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxonomyComponent ],
      imports: [
        CommonModule,
        NoopAnimationsModule,
        MatCheckboxModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDialogModule
      ],
      providers: [
        { provide: GlobalService, useValue: {} },
        { provide: TaxonomyListService, useValue: {} },
        { provide: SearchfieldsListService, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
