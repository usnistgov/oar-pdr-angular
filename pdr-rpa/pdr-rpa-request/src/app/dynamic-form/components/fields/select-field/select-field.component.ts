import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FieldConfig, FieldOption } from '../../../models';
import { ValidatorFactoryService } from '../../../services';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field [appearance]="'outline'" [class]="getWidthClass()">
      <mat-label>{{ field.label }}</mat-label>
      <mat-select
        [formControl]="control"
        [placeholder]="field.placeholder || 'Select an option'"
        [required]="field.required"
      >
        <mat-option *ngFor="let option of filteredOptions" [value]="option.value" [disabled]="option.disabled">
          {{ option.label }}
        </mat-option>
      </mat-select>
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
export class SelectFieldComponent implements OnInit, OnChanges {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;
  @Input() dynamicOptions?: FieldOption[];

  filteredOptions: FieldOption[] = [];

  constructor(private validatorFactory: ValidatorFactoryService) {}

  ngOnInit(): void {
    this.updateOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dynamicOptions'] || changes['field']) {
      this.updateOptions();
    }
  }

  get control(): FormControl {
    return this.form.get(this.field.id) as FormControl;
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

  private updateOptions(): void {
    // Use dynamic options if provided, otherwise use field options
    let options = this.dynamicOptions || this.field.options || [];

    // Apply blacklist filter if configured
    if (this.field.filterBlacklist && this.field.filterBlacklist.length > 0) {
      const blacklist = new Set(this.field.filterBlacklist.map(s => s.toLowerCase()));
      options = options.filter(opt =>
        !blacklist.has(String(opt.label).toLowerCase()) &&
        !blacklist.has(String(opt.value).toLowerCase())
      );
    }

    this.filteredOptions = options;
  }
}
