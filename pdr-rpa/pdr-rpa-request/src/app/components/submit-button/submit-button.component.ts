import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
})
export class SubmitButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() text: string;
  @Output() onClick = new EventEmitter<void>();
  @Input() isLoading = false;
  @ViewChild(ProgressSpinner) spinner: ProgressSpinner;
  constructor() {

  }

  ngOnInit(): void {
      
  }

}
