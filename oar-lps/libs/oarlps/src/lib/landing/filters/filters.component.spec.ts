import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FiltersComponent } from './filters.component';
import { AppConfig } from '../../config/config'
import { TransferState } from '@angular/core';
import { SearchService } from '../../shared/search-service/index';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { testdata } from '../../../environments/environment';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { TaxonomyComponent } from '../taxonomy/taxonomy.component';
import { CollectionService } from '../../shared/collection-service/collection.service';
import { config } from '../../../environments/environment';

describe('FiltersComponent', () => {
    let component: FiltersComponent;
    let fixture: ComponentFixture<FiltersComponent>;
    let plid : Object = "browser";
    let ts : TransferState = new TransferState();
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);
    let nrd1 = testdata['forensics'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ FiltersComponent, TaxonomyComponent ],
            imports: [
                HttpClientTestingModule, 
                AutoCompleteModule,
                FormsModule,
                TreeModule,
                BrowserAnimationsModule,
                TaxonomyModule],
            providers: [
                SearchService,
                CollectionService,
                { provide: AppConfig,       useValue: cfg }
            ]
        })
        .compileComponents();
    });

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
