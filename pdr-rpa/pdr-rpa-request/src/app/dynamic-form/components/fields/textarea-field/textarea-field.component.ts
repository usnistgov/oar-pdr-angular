import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FieldConfig } from '../../../models';
import { ValidatorFactoryService } from '../../../services';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="'outline'" class="full-width">
      <mat-label>{{ field.label }}</mat-label>
      <textarea
        matInput
        [formControl]="control"
        [placeholder]="field.placeholder || ''"
        [rows]="field.rows || 4"
        [maxlength]="field.maxChars"
        [required]="field.required"
      ></textarea>
      <mat-hint *ngIf="field.hint">{{ field.hint }}</mat-hint>
      <mat-hint *ngIf="field.maxChars" align="end">
        {{ control.value?.length || 0 }} / {{ field.maxChars }}
      </mat-hint>
      <mat-error *ngIf="control.invalid && control.touched">
        {{ getErrorMessage() }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
    }

    .full-width {
      width: 100%;

      ::ng-deep {
        .mat-mdc-form-field-subscript-wrapper {
          height: 0;
          margin-bottom: 0;
        }

        .mat-mdc-form-field-bottom-align::before {
          height: 0;
        }
      }
    }
  `]
})
export class TextareaFieldComponent {
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
