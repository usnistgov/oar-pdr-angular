import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Collapse } from './collapse.directive';


@Component({
  template: `
  <i style="cursor: pointer;" class ="faa"  aria-hidden="true" (click)="isCollapsedContent = !isCollapsedContent;"></i>
  <div [collapse]="!isCollapsedContent" style="background-color:#FFFFF">
     <span> Test This Div!!</span>
  </div>
  `,

})
class TestComponent { }

describe('Collapse Directive', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let iEle: DebugElement;
  let divEle: DebugElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Collapse, TestComponent]
    })
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    iEle = fixture.debugElement.query(By.css('i'));
    divEle = fixture.debugElement.query(By.css('div'));
    fixture.detectChanges(); // initial bindin
  });

  // color and event test
  it('should have collapsed elements', () => {
    iEle.triggerEventHandler('mouseclick', null);
    fixture.detectChanges();
    expect(divEle.nativeElement.style.backgroundColor).toBe('');
  });


});
