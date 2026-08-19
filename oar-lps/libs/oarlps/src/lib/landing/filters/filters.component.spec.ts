import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FiltersComponent } from './filters.component';
import { AppConfig } from '../../config/config';
import { ChangeDetectorRef, TransferState } from '@angular/core';
import { SearchService } from '../../shared/search-service/index';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { TaxonomyComponent } from '../taxonomy/taxonomy.component';
import { CollectionService } from '../../shared/collection-service/collection.service';
import { config } from '../../../environments/environment';
import { testdata } from '../../../environments/environment';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing'; // Import the testing module
import { FaTestingConfig } from '@fortawesome/angular-fontawesome/testing';
import { GlobalService } from '../../shared/globals/globals';
import { TaxonomyListService } from '../../shared/taxonomy-list';
import { SearchfieldsListService } from '../../shared/searchfields-list';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

describe('FiltersComponent', () => {
    let component: FiltersComponent;
    let fixture: ComponentFixture<FiltersComponent>;
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let nrd1 = testdata['forensics'];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ FiltersComponent, TaxonomyComponent ],
            imports: [
                CommonModule,
                NoopAnimationsModule,
                HttpClientTestingModule,
                AutoCompleteModule,
                FormsModule,
                TreeModule,
                MatAutocompleteModule,
                MatFormFieldModule,
                MatChipsModule,
                MatInputModule,
                MatIconModule,
                TaxonomyModule,
                FontAwesomeTestingModule],
            providers: [
                SearchService,
                CollectionService,
                { provide: AppConfig, useValue: cfg },
                { provide: GlobalService, useValue: {
    watchColorPalette: (callback) => {
        // Call the callback with a mock color palette
        callback({
            defaultVar: '#ffffff',
            lighterVar: '#f0f0f0',
            hoverVar: '#e0e0e0'
        });
    }
} },
                { provide: TaxonomyListService, useValue: {} },
                { provide: SearchfieldsListService, useValue: {} },
                { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
                                {
                    provide: FaTestingConfig,
                    useValue: {
                        circleIcon: 'undo'
                    }
                }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FiltersComponent);
        component = fixture.componentInstance;
        component.md = nrd1;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
