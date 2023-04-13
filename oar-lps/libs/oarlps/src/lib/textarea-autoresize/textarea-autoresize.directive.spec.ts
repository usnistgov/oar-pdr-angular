import { TextareaAutoresizeDirective } from './textarea-autoresize.directive';
import { Directive, ElementRef, HostListener } from '@angular/core';

describe('TextareaAutoresizeDirective', () => {
    let elementRef: ElementRef

    it('should create an instance', () => {
        const directive = new TextareaAutoresizeDirective(elementRef);
        expect(directive).toBeTruthy();
    });
});
