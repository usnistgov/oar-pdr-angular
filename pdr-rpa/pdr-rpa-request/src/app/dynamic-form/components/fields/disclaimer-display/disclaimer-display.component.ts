import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-disclaimer-display',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="disclaimer-container" *ngIf="items && items.length > 0">
      <div class="disclaimer-header">
        <mat-icon class="disclaimer-icon">warning</mat-icon>
        <span class="disclaimer-title">Disclaimer</span>
      </div>
      <div *ngFor="let disclaimer of items" class="disclaimer-text">
        {{ disclaimer }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 12px;
    }

    .disclaimer-container {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fcd34d;
      border-radius: 10px;
      padding: 14px 18px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .disclaimer-header {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      gap: 10px;
    }

    .disclaimer-icon {
      color: #d97706;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .disclaimer-title {
      font-weight: 600;
      font-size: 1rem;
      color: #92400e;
    }

    .disclaimer-text {
      color: #78350f;
      line-height: 1.6;
      font-size: 0.9375rem;
      margin-bottom: 10px;
      padding-left: 32px;
    }

    .disclaimer-text:last-child {
      margin-bottom: 0;
    }
  `]
})
export class DisclaimerDisplayComponent {
  @Input() items: string[] = [];
}
