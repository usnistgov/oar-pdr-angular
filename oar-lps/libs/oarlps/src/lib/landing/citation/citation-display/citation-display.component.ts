import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-citation-display',
  standalone: true,
  imports: [],
  templateUrl: './citation-display.component.html',
  styleUrl: './citation-display.component.css'
})
export class CitationDisplayComponent {
    @Input() citetext : string;
}
