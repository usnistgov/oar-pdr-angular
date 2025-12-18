import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    Output,
    EventEmitter
  } from '@angular/core';

@Component({
  selector: 'mds-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mds-checkbox.component.html',
  styleUrl: './mds-checkbox.component.scss'
})
export class MdsCheckboxComponent {
    @Input() checked: boolean = false;
    @Input() label: string = '';
    @Output() checkedChange = new EventEmitter<boolean>();
  
    toggleCheck() {
      this.checked = !this.checked;
      this.checkedChange.emit(this.checked);
    }
}
