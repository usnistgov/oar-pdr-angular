import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FieldConfig } from '../../../models';
import { ValidatorFactoryService } from '../../../services';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  template: `
    <div class="checkbox-container">
      <mat-checkbox
        [formControl]="control"
        [color]="'primary'"
        [required]="field.required"
      >
        {{ field.label }}
        <span *ngIf="field.required" class="required-star">*</span>
      </mat-checkbox>
      <div *ngIf="field.hint" class="hint-text">{{ field.hint }}</div>
      <div *ngIf="control.invalid && control.touched" class="error-text">
        {{ getErrorMessage() }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 8px;
    }

    .checkbox-container {
      padding: 4px 0;
    }

    .required-star {
      color: #ef4444;
      font-weight: 500;
      margin-left: 2px;
    }

    .hint-text {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 6px;
      margin-left: 32px;
    }

    .error-text {
      font-size: 0.8125rem;
      color: #ef4444;
      margin-top: 6px;
      margin-left: 32px;
    }

    ::ng-deep .mat-mdc-checkbox {
      .mdc-form-field {
        align-items: center;
      }

      .mdc-label {
        white-space: normal;
        line-height: 1.5;
        color: #374151;
        padding-left: 8px;
      }
    }
  `]
})
export class CheckboxFieldComponent {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;

  constructor(private validatorFactory: ValidatorFactoryService) {}

  get control(): FormControl {
    return this.form.get(this.field.id) as FormControl;
  }

  getErrorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';

    const errorKey = Object.keys(errors)[0];
    return this.validatorFactory.getErrorMessage(
      errorKey,
      errors[errorKey],
      this.field.errorMessages
    );
  }
}
