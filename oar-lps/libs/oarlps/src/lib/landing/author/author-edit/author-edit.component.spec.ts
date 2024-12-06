import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthorEditComponent } from './author-edit.component';
import { AppConfig, LPSConfig } from '../../../config/config';
import { ConfigurationService, StaffDirectoryService } from 'oarng';
import { config } from '../../../../environments/environment';

describe('AuthorEditComponent', () => {
  let component: AuthorEditComponent;
  let fixture: ComponentFixture<AuthorEditComponent>;
  let cfgd: LPSConfig = JSON.parse(JSON.stringify(config));
  cfgd['staffdir'] = { serviceEndpoint: "/midas/nsd/oar1" };
  let cfg : AppConfig = new AppConfig(null);
  cfg.loadConfig(cfgd);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ AuthorEditComponent ],
      providers: [
        { provide: ConfigurationService, useValue: cfg },
        StaffDirectoryService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
