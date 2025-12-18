import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FieldConfig } from '../../../models';

@Component({
  selector: 'app-checkbox-group-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  template: `
    <div class="checkbox-group-container">
      <label *ngIf="field.label" class="group-label">
        {{ field.label }}
        <span *ngIf="field.allRequired" class="required-star">*</span>
      </label>

      <div *ngFor="let item of items; let i = index" class="checkbox-item">
        <mat-checkbox
          [formControl]="getControl(i)"
          [color]="'primary'"
        >
          {{ item }}
        </mat-checkbox>
        <div *ngIf="getControl(i).invalid && getControl(i).touched" class="error-text">
          You must accept this agreement
        </div>
      </div>

      <div *ngIf="hasError()" class="group-error">
        Please accept all required agreements
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 12px;
    }

    .checkbox-group-container {
      padding: 12px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .group-label {
      display: block;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 16px;
      color: #1e293b;
    }

    .checkbox-item {
      margin-bottom: 8px;
      padding: 10px 12px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .required-star {
      color: #ef4444;
      font-weight: 500;
      margin-left: 4px;
    }

    .error-text {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 6px;
      margin-left: 32px;
    }

    .group-error {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 12px;
      padding: 8px 12px;
      background: #fef2f2;
      border-radius: 6px;
      border: 1px solid #fecaca;
    }

    ::ng-deep .mat-mdc-checkbox {
      .mdc-form-field {
        align-items: center;
      }

      .mdc-label {
        white-space: normal;
        line-height: 1.5;
        color: #374151;
        font-size: 0.9375rem;
        padding-left: 8px;
      }
    }
  `]
})
export class CheckboxGroupFieldComponent implements OnInit, OnChanges {
  @Input() field!: FieldConfig;
  @Input() form!: FormGroup;
  @Input() items: string[] = [];

  ngOnInit(): void {
    this.ensureControls();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.ensureControls();
    }
  }

  getControl(index: number): FormControl {
    const controlName = `${this.field.id}_${index}`;
    return this.form.get(controlName) as FormControl;
  }

  hasError(): boolean {
    for (let i = 0; i < this.items.length; i++) {
      const control = this.getControl(i);
      if (control && control.invalid && control.touched) {
        return true;
      }
    }
    return false;
  }

  private ensureControls(): void {
    if (!this.items || !this.form) return;

    // Add controls for each item if they don't exist
    this.items.forEach((_, index) => {
      const controlName = `${this.field.id}_${index}`;
      if (!this.form.contains(controlName)) {
        const validators = this.field.allRequired ? [Validators.requiredTrue] : [];
        this.form.addControl(controlName, new FormControl(false, validators));
      }
    });

    // Remove controls that no longer have items
    Object.keys(this.form.controls).forEach(key => {
      if (key.startsWith(`${this.field.id}_`)) {
        const index = parseInt(key.split('_').pop() || '-1', 10);
        if (index >= this.items.length) {
          this.form.removeControl(key);
        }
      }
    });
  }
}
