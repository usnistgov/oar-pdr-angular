import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { FieldConfig } from '../../../models';

@Component({
  selector: 'app-recaptcha-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule, RecaptchaFormsModule],
  template: `
    <div class="recaptcha-container">
      <re-captcha
        [formControl]="control"
      ></re-captcha>
      <div *ngIf="control.invalid && control.touched" class="error-text">
        Please complete the reCAPTCHA verification
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 12px;
    }

    .recaptcha-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .error-text {
      font-size: 0.8125rem;
      color: #ef4444;
      margin-top: 12px;
      padding: 8px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
    }
  `]
})
export class RecaptchaFieldComponent {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;

  get control(): FormControl {
    return this.form.get(this.field.id) as FormControl;
  }
}
