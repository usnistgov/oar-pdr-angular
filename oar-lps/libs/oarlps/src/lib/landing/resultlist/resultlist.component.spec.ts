import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchService } from '../../shared/search-service/index';
import { ResultlistComponent } from './resultlist.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../../config/config'
import { TransferState } from '@angular/core';
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { config, testdata } from '../../../environments/environment';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { CollectionService } from '../../shared/collection-service/collection.service';
import * as env from '../../../environments/environment';

describe('ResultlistComponent', () => {
  let component: ResultlistComponent;
  let fixture: ComponentFixture<ResultlistComponent>;
  let cfg : AppConfig = new AppConfig(null);
  cfg.loadConfig(config);
  let nrd1 = testdata['test1'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [
            HttpClientTestingModule, 
            DropdownModule,
            FormsModule,
            InputTextareaModule],
        declarations: [ ResultlistComponent ],
        providers: [
            SearchService,
            GoogleAnalyticsService,
            CollectionService,
            { provide: AppConfig,       useValue: cfg }
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
        fixture = TestBed.createComponent(ResultlistComponent);
        component = fixture.componentInstance;
        component.md = nrd1;
        fixture.detectChanges();
  });

  it('should create', () => {
        expect(component).toBeTruthy();
  });
});
