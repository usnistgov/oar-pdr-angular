import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { IspartofComponent } from './ispartof.component';
import { testdata } from '../../../environments/environment';
import { IspartofEditComponent } from './ispartof-edit/ispartof-edit.component';
import { IspartofPubComponent } from './ispartof-pub/ispartof-pub.component';

describe('IspartofComponent', () => {
  let component: IspartofComponent;
  let fixture: ComponentFixture<IspartofComponent>;
  let nrd1 = testdata['forensics'];

  beforeEach(waitForAsync(() => {
    @Component({
        selector: "ispartof-pub",
        standalone: true,
        template: `<div></div>`,
    })
    class TestIspartofPubComponent {}

    @Component({
        selector: "ispartof-edit",
        standalone: true,
        template: `<div></div>`,
    })
    class TestIspartofEditComponent {}

    TestBed.overrideComponent(IspartofComponent, {
        add: {
            imports: [
                TestIspartofPubComponent,
                TestIspartofEditComponent
            ],
        },
        remove: {
            imports: [
                IspartofPubComponent,
                IspartofEditComponent
            ],
        },
    });

    // await TestBed.configureTestingModule({
    //   imports: [ IspartofComponent ],
    //   providers: [ 
    //     MetadataUpdateService,
    //     UserMessageService,
    //     AuthService,
    //     DatePipe,
    //     GoogleAnalyticsService,
    //     { provide: AppConfig,       useValue: cfg } ]
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IspartofComponent);
    component = fixture.componentInstance;
    component.record = nrd1;
    component.inBrowser = true;
    component.isEditMode = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
