import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'noid-template',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrls: ['landing.component.css'],
  template: `
  <div class="grid">
      <div class = "col-12 col-md-12 col-lg-12 col-sm-12">
        <h3 id="noid" name="noid"><b>Empty Record</b></h3><br>
        <div>Landing page is empty as no record id provided.</div>
      </div>
   </div>
  `
})

export class NoidComponent {

}