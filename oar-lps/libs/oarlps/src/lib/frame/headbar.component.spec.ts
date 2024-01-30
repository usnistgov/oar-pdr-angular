import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { TransferState } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeadbarComponent } from './headbar.component';

@Component({ template: '' })
class DummyComponent {}

describe('HeadbarComponent', () => {
    let component: HeadbarComponent;
    let fixture: ComponentFixture<HeadbarComponent>;
  
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ HeadbarComponent ]
      })
      .compileComponents();
    });
  
    beforeEach(() => {
      fixture = TestBed.createComponent(HeadbarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
      });
});
