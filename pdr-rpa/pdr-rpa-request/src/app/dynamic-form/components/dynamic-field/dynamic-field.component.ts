import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { FieldConfig, FieldOption } from '../../models';
import {
  TextFieldComponent,
  TextareaFieldComponent,
  SelectFieldComponent,
  CheckboxFieldComponent,
  CheckboxGroupFieldComponent,
  RecaptchaFieldComponent,
  TermsDisplayComponent,
  DisclaimerDisplayComponent
} from '../fields';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [
    CommonModule,
    TextFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent,
    CheckboxFieldComponent,
    CheckboxGroupFieldComponent,
    RecaptchaFieldComponent,
    TermsDisplayComponent,
    DisclaimerDisplayComponent
  ],
  template: `
    @switch (field.type) {
      @case ('text') {
        <app-text-field [field]="field" [form]="form"></app-text-field>
      }
      @case ('email') {
        <app-text-field [field]="field" [form]="form"></app-text-field>
      }
      @case ('tel') {
        <app-text-field [field]="field" [form]="form"></app-text-field>
      }
      @case ('textarea') {
        <app-textarea-field [field]="field" [form]="form"></app-textarea-field>
      }
      @case ('select') {
        <app-select-field
          [field]="field"
          [form]="form"
          [dynamicOptions]="selectOptions"
        ></app-select-field>
      }
      @case ('checkbox') {
        <app-checkbox-field [field]="field" [form]="form"></app-checkbox-field>
      }
      @case ('checkbox-group') {
        <app-checkbox-group-field
          [field]="field"
          [form]="form"
          [items]="checkboxGroupItems"
        ></app-checkbox-group-field>
      }
      @case ('recaptcha') {
        <app-recaptcha-field [field]="field" [form]="form"></app-recaptcha-field>
      }
      @case ('terms-display') {
        <app-terms-display [field]="field" [items]="termsItems"></app-terms-display>
      }
      @case ('disclaimer-display') {
        <app-disclaimer-display [items]="disclaimerItems"></app-disclaimer-display>
      }
      @default {
        <div class="unsupported-field">
          Unsupported field type: {{ field.type }}
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .unsupported-field {
      padding: 16px;
      background-color: #ffebee;
      border: 1px solid #ef9a9a;
      border-radius: 4px;
      color: #c62828;
      margin-bottom: 16px;
    }
  `]
})
export class DynamicFieldComponent {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;

  // Dynamic data inputs
  @Input() selectOptions?: FieldOption[];
  @Input() checkboxGroupItems?: string[];
  @Input() termsItems?: string[];
  @Input() disclaimerItems?: string[];
}
