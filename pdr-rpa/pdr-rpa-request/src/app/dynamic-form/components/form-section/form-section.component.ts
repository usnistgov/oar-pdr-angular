import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { SectionConfig, DatasetConfig, FieldOption } from '../../models';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatExpansionModule, DynamicFieldComponent],
  template: `
    @if (section.collapsible) {
      <mat-expansion-panel [expanded]="section.expanded !== false">
        <mat-expansion-panel-header>
          <mat-panel-title>{{ section.title }}</mat-panel-title>
          <mat-panel-description *ngIf="section.description">
            {{ section.description }}
          </mat-panel-description>
        </mat-expansion-panel-header>

        <ng-container *ngTemplateOutlet="sectionContent"></ng-container>
      </mat-expansion-panel>
    } @else {
      <div class="section-container" [class]="section.cssClass">
        <div *ngIf="section.title" class="section-header">
          <h3 class="section-title">{{ section.title }}</h3>
          <p *ngIf="section.description" class="section-description">
            {{ section.description }}
          </p>
        </div>

        <ng-container *ngTemplateOutlet="sectionContent"></ng-container>
      </div>
    }

    <ng-template #sectionContent>
      <div class="section-fields">
        @for (field of section.fields; track field.id) {
          <app-dynamic-field
            [field]="field"
            [form]="form"
            [selectOptions]="getSelectOptions(field.id)"
            [checkboxGroupItems]="getCheckboxGroupItems(field.id)"
            [termsItems]="getTermsItems(field.id)"
            [disclaimerItems]="getDisclaimerItems(field.id)"
          ></app-dynamic-field>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }

    .section-container {
      padding: 0;
    }

    .section-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    }

    .section-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 20px;
        background: linear-gradient(135deg, #008097 0%, #006778 100%);
        border-radius: 2px;
      }
    }

    .section-description {
      margin: 10px 0 0 12px;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.5;
    }

    .section-fields {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    mat-expansion-panel {
      margin-bottom: 16px;
      border-radius: 8px !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
    }
  `]
})
export class FormSectionComponent {
  @Input() section!: SectionConfig;
  @Input() form!: FormGroup;
  @Input() dataset?: DatasetConfig;
  @Input() countryOptions?: FieldOption[];

  getSelectOptions(fieldId: string): FieldOption[] | undefined {
    const field = this.section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'select') return undefined;

    // Handle dynamic options sources
    if (field.optionsSource === 'countries') {
      return this.countryOptions;
    }

    return field.options;
  }

  getCheckboxGroupItems(fieldId: string): string[] | undefined {
    const field = this.section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'checkbox-group') return undefined;

    // Handle dynamic sources from dataset
    if (field.optionsSource === 'dataset.agreements' && this.dataset) {
      return this.dataset.agreements;
    }

    return field.content;
  }

  getTermsItems(fieldId: string): string[] | undefined {
    const field = this.section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'terms-display') return undefined;

    // Get terms from dataset
    if (field.optionsSource === 'dataset.terms' && this.dataset) {
      return this.dataset.terms;
    }

    return field.content;
  }

  getDisclaimerItems(fieldId: string): string[] | undefined {
    const field = this.section.fields.find(f => f.id === fieldId);
    if (!field || field.type !== 'disclaimer-display') return undefined;

    // Get disclaimers from dataset
    if (this.dataset) {
      return this.dataset.disclaimers;
    }

    return field.content;
  }
}
