import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldConfig } from '../../../models';

@Component({
  selector: 'app-terms-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-container" *ngIf="items && items.length > 0">
      <h4 *ngIf="field.label" class="terms-title">{{ field.label }}</h4>
      <ul class="terms-list">
        <li *ngFor="let term of items" [innerHTML]="term"></li>
      </ul>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 12px;
    }

    .terms-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 18px;
    }

    .terms-title {
      margin: 0 0 16px 0;
      color: #1e293b;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 18px;
        background: linear-gradient(135deg, #008097 0%, #006778 100%);
        border-radius: 2px;
      }
    }

    .terms-list {
      margin: 0;
      padding-left: 24px;
      color: #374151;
    }

    .terms-list li {
      margin-bottom: 12px;
      line-height: 1.6;
      font-size: 0.9375rem;
      position: relative;

      &::marker {
        color: #008097;
      }
    }

    .terms-list li:last-child {
      margin-bottom: 0;
    }
  `]
})
export class TermsDisplayComponent {
  @Input() field!: FieldConfig;
  @Input() items: string[] = [];
}
