import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-request-form-terms',
  templateUrl: './request-form-terms.component.html',
  styleUrls: ['./request-form-terms.component.css']
})
export class RequestFormTermsComponent implements OnInit {

  @Input() terms: string[] | null | undefined = [];
  domparser = new DOMParser();
  constructor() { }

  ngOnInit() {

  }

}
