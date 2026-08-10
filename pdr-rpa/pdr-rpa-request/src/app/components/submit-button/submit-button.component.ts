import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css'],
  standalone: true,
  imports: [MatProgressSpinnerModule]
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
