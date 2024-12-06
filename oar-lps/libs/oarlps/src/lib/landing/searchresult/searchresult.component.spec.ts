import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchresultComponent } from './searchresult.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { FiltersComponent } from '../filters/filters.component';
import { ResultlistComponent } from '../resultlist/resultlist.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../config/config'
import { TransferState } from '@angular/platform-browser';
import { SearchService } from '../../shared/search-service/index';
import { DropdownModule } from "primeng/dropdown";
import { TreeModule } from 'primeng/tree';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { config, testdata } from '../../../environments/environment';

describe('SearchresultComponent', () => {
    let component: SearchresultComponent;
    let fixture: ComponentFixture<SearchresultComponent>;
    let plid : Object = "browser";
    let ts : TransferState = new TransferState();
    let nrd1 = testdata['test1'];
    let cfg: AppConfig = new AppConfig(null);
    cfg.loadConfig(config);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        declarations: [ SearchresultComponent, FiltersComponent, ResultlistComponent ],
        imports: [
            BrowserAnimationsModule, 
            HttpClientTestingModule, 
            DropdownModule, 
            TreeModule, 
            AutoCompleteModule,
            FormsModule],
        providers: [
            { provide: AppConfig,       useValue: cfg },
            SearchService,
            TransferState]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchresultComponent);
        component = fixture.componentInstance;
        component.record = nrd1;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should have title', () => {
        let m = fixture.nativeElement.querySelectorAll('#datasetlist-heading');
        expect(m.length).toEqual(1);
        let m0 = m.item(0);
        expect(m.item(0).innerHTML).toContain('Datasets in this collection');
    });
});
