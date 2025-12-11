import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { FormConfig, DatasetConfig, FieldOption } from '../../models';
import { DynamicFormBuilderService } from '../../services';
import { FormSectionComponent } from '../form-section/form-section.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    FormSectionComponent
  ],
  template: `
    <div class="dynamic-form-container" *ngIf="formConfig && form">
      <!-- Required Fields Notice -->
      <div class="required-notice">
        <mat-icon>info_outline</mat-icon>
        <span>Fields marked with <span class="required-star">*</span> are required</span>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        @for (section of formConfig.sections; track section.id; let i = $index) {
          <div class="section-wrapper" [style.animation-delay]="(i * 0.1) + 's'">
            <app-form-section
              [section]="section"
              [form]="form"
              [dataset]="dataset"
              [countryOptions]="countryOptions"
            ></app-form-section>
          </div>
        }

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="submit"
            [disabled]="isLoading"
            class="submit-button"
          >
            @if (isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              <span>Submitting request...</span>
            } @else {
              <mat-icon>send</mat-icon>
              <span>{{ formConfig.submitButton?.label || 'Submit Request' }}</span>
            }
          </button>

          <div class="privacy-notice">
            <mat-icon>lock</mat-icon>
            <span>Your information is protected and will only be used to process your request.</span>
          </div>
        </div>
      </form>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Processing your request...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dynamic-form-container {
      position: relative;
    }

    .required-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
      border-radius: 8px;
      margin-bottom: 28px;
      font-size: 0.875rem;
      color: #1e40af;
      animation: fadeIn 0.4s ease-out;

      mat-icon {
        color: #3b82f6;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .required-star {
        color: #ef4444;
        font-weight: 600;
        font-size: 1rem;
      }
    }

    .section-wrapper {
      animation: fadeInUp 0.5s ease-out backwards;
      margin-bottom: 24px;
    }

    .section-wrapper:last-of-type {
      margin-bottom: 0;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 32px;
      padding-top: 28px;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }

    .submit-button {
      width: 100%;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      border-radius: 10px;
      background: linear-gradient(135deg, #008097 0%, #006778 100%);
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px 0 rgba(0, 128, 151, 0.35);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(0, 128, 151, 0.45);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        background: #94a3b8;
        box-shadow: none;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      mat-spinner {
        display: inline-block;
      }
    }

    .privacy-notice {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.8125rem;
      color: #64748b;
      line-height: 1.5;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-top: 2px;
        color: #94a3b8;
      }
    }

    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      p {
        color: #64748b;
        font-size: 1rem;
        margin: 0;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() formConfig!: FormConfig;
  @Input() dataset?: DatasetConfig;
  @Input() countryOptions?: FieldOption[];

  @Output() formSubmit = new EventEmitter<Record<string, any>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formValid = new EventEmitter<boolean>();

  form!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: DynamicFormBuilderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] || changes['dataset']) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    if (!this.formConfig) return;

    this.form = this.formBuilder.buildForm(this.formConfig, this.dataset);

    // Emit validity changes
    this.form.statusChanges.subscribe(() => {
      this.formValid.emit(this.form.valid);
    });
  }

  onSubmit(): void {
    // Mark all controls as touched to trigger validation display
    this.markAllAsTouched();

    if (this.form.valid) {
      const values = this.formBuilder.getFormValues(this.form);
      this.formSubmit.emit(values);
    } else {
      this.showValidationError();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  resetForm(): void {
    this.formBuilder.resetForm(this.form, this.formConfig);
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private showValidationError(): void {
    const message = this.formConfig.errorMessage ||
      'Please correct the errors in the form before submitting.';
    this.showError(message);
  }
}
