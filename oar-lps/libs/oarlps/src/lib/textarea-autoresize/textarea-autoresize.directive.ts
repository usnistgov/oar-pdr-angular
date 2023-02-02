import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[libTextareaAutoresize]'
})
export class TextareaAutoresizeDirective {

    constructor(private elementRef: ElementRef) { }

    @HostListener(':input')
    onInput() {
      this.resize();
    }

    ngOnInit() {
        if (this.elementRef.nativeElement.scrollHeight) {
          setTimeout(() => this.resize());
        }
    }

    resize() {
        this.elementRef.nativeElement.style.height = '0';
        this.elementRef.nativeElement.style.height = this.elementRef.nativeElement.scrollHeight + 'px';
    }

}
