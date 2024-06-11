import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    it('Next step button', fakeAsync(() => {
        let button = fixture.debugElement.nativeElement.querySelector('#nextbtn');
        expect(button.disabled).toBeTruthy();
        
        component.currentStep.canGoNext = true;
        fixture.detectChanges();
    
        expect(button.disabled).toBeFalsy();
    }));

    it('Prev step button', fakeAsync(() => {
        let button = fixture.debugElement.nativeElement.querySelector('#prevbtn');
        expect(button.disabled).toBeTruthy();
        
        component.currentStep.canGoPrev = true;
        fixture.detectChanges();
    
        expect(button.disabled).toBeFalsy();
    }));
});
