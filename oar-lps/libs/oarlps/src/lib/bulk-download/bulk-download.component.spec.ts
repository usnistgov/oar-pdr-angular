import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { BulkDownloadComponent } from './bulk-download.component';
import * as mock from '../testing/mock.services';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TransferState } from '@angular/core';
import { AppConfig } from '../config/config';
import * as env from '../../environments/environment';

describe('BulkDownloadComponent', () => {
  let component: BulkDownloadComponent;
  let fixture: ComponentFixture<BulkDownloadComponent>;
  let route : ActivatedRoute;
  let cfg: AppConfig;
  let plid: Object = "browser";
  let ts: TransferState = new TransferState();

  beforeEach(async () => {
    let path = "/bulkdownload";
    let params = {};
    let r : unknown = new mock.MockActivatedRoute(path, params);
    route = r as ActivatedRoute;
    cfg = new AppConfig(null);
    cfg.loadConfig(env.config)
    // cfg = (new AngularEnvironmentConfigService(plid, ts)).getConfig() as AppConfig;

    await TestBed.configureTestingModule({
      declarations: [  ],
      imports: [ NoopAnimationsModule, BulkDownloadComponent ],
      providers: [
        { provide: ActivatedRoute,  useValue: route },
        { provide: AppConfig, useValue: cfg },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});