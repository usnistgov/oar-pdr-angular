import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PeopleComponent } from './people.component';
import { AppConfig, LPSConfig } from '../../config/config';
import { ConfigurationService, StaffDirectoryService } from 'oarng';
import { config } from '../../../environments/environment';

describe('PeopleComponent', () => {
  let component: PeopleComponent;
  let fixture: ComponentFixture<PeopleComponent>;
  let service: StaffDirectoryService;
  let cfgd: LPSConfig = JSON.parse(JSON.stringify(config));
  cfgd['staffdir'] = { serviceEndpoint: "/midas/nsd/oar1" };
  let cfg : AppConfig = new AppConfig(null);
  cfg.loadConfig(cfgd);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [PeopleComponent],
      providers: [
        { provide: ConfigurationService, useValue: cfg },
        StaffDirectoryService
      ]
    });

    service = TestBed.inject(StaffDirectoryService);

    fixture = TestBed.createComponent(PeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
