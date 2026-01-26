import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FieldConfig } from '../../../models';
import { ValidatorFactoryService } from '../../../services';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="'outline'" [class]="getWidthClass()">
      <mat-label>{{ field.label }}</mat-label>
      <input
        matInput
        [formControl]="control"
        [type]="getInputType()"
        [placeholder]="field.placeholder || ''"
        [autocomplete]="field.autocomplete || 'off'"
        [maxlength]="field.maxChars"
        [required]="field.required"
      />
      <mat-hint *ngIf="field.hint">{{ field.hint }}</mat-hint>
      <mat-error *ngIf="control.invalid && control.touched">
        {{ getErrorMessage() }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-form-field {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: white;
          border-radius: 8px;
        }

        .mat-mdc-form-field-subscript-wrapper {
          height: 0;
          margin-bottom: 0;
        }

        .mat-mdc-form-field-bottom-align::before {
          height: 0;
        }

        .mdc-notched-outline__notch {
          border-right: none;
        }

        .mat-mdc-floating-label {
          font-size: 0.9375rem;
        }
      }
    }

    .width-full { width: 100%; }
    .width-half { width: calc(50% - 8px); }
    .width-third { width: calc(33.33% - 8px); }
    .width-quarter { width: calc(25% - 8px); }

  `]
})
export class TextFieldComponent {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;

  constructor(private validatorFactory: ValidatorFactoryService) {}

  get control(): FormControl {
    return this.form.get(this.field.id) as FormControl;
  }

  getInputType(): string {
    switch (this.field.type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      default:
        return 'text';
    }
  }

  getWidthClass(): string {
    return `width-${this.field.width || 'full'}`;
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
