import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unescapehtml'
})
export class UnescapeHTMLPipe implements PipeTransform{
    transform(value: any, args?: any): any {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        return doc.documentElement.textContent;
      }
}