import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepWizardComponent } from './stepwizard.component';
import { FormGroup, FormGroupDirective, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthModule, AuthenticationService, OARAuthenticationService, MockAuthenticationService } from 'oarng';
import { UserMessageService } from 'oarlps';

describe('WizardComponent', () => {
    let component: StepWizardComponent;
    let fixture: ComponentFixture<StepWizardComponent>;
    let authsvc: AuthenticationService = new MockAuthenticationService(undefined);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ StepWizardComponent ],
            imports: [ RouterTestingModule, HttpClientTestingModule ],
            providers: [ 
                FormGroupDirective,
                FormBuilder,
                MockAuthenticationService,
                AuthenticationService,
                UserMessageService
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StepWizardComponent);
        component = fixture.componentInstance;
        component.authService = authsvc;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
