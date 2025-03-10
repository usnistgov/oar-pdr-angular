import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppConfig } from '../../config/config'
import { MenuComponent } from './menu.component';
import { TransferState } from '@angular/core';
import { config, testdata } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  let cfg = new AppConfig(null);
  cfg.loadConfig(config);  cfg : AppConfig;
  let plid : Object = "browser";
  let ts : TransferState = new TransferState();
  let md = testdata['test1'];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ MenuComponent, HttpClientTestingModule ],
      providers: [
        HttpClient,
        HttpTestingController,
        { provide: AppConfig,  useValue: cfg }
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    component.record = md;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
