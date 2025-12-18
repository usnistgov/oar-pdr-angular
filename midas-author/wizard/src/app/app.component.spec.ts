import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { APP_BASE_HREF } from '@angular/common';
import { AuthModule, AuthenticationService, OARAuthenticationService, MockAuthenticationService } from 'oarng';
import {
    ConfigModule, ConfigurationService, CONFIG_URL, RELEASE_INFO, Credentials
} from 'oarng';

describe('AppComponent', () => {
    let configService: ConfigurationService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule, AppModule
            ],
            declarations: [
            ],
            providers: [
                {provide: APP_BASE_HREF, useValue: '/'},
                MockAuthenticationService,
                ConfigurationService,
                AuthenticationService
            ]
        }).compileComponents();

        configService = TestBed.inject(ConfigurationService);
        jest.spyOn(configService, 'getConfig').mockReturnValue({ links: { portalBase: 'https://localhost/' } });

    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it("should have as title 'Create a New DAP'", () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('Create a New DAP');
    });
});
