import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldConfig, FormConfig, SectionConfig, DatasetConfig } from '../models';
import { ValidatorFactoryService } from './validator-factory.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormBuilderService {

  constructor(private validatorFactory: ValidatorFactoryService) {}

  /**
   * Build a FormGroup from a FormConfig
   */
  buildForm(formConfig: FormConfig, dataset?: DatasetConfig): FormGroup {
    const group: Record<string, FormControl> = {};

    for (const section of formConfig.sections) {
      this.buildSectionControls(section, group, dataset);
    }

    return new FormGroup(group);
  }

  /**
   * Build form controls for a section
   */
  private buildSectionControls(
    section: SectionConfig,
    group: Record<string, FormControl>,
    dataset?: DatasetConfig
  ): void {
    for (const field of section.fields) {
      // Handle special field types
      if (field.type === 'checkbox-group' && field.optionsSource === 'dataset.agreements') {
        // Create dynamic agreement controls from dataset
        if (dataset?.agreements) {
          dataset.agreements.forEach((_, index) => {
            const controlId = `${field.id}_${index}`;
            group[controlId] = this.createControl({
              ...field,
              id: controlId,
              type: 'checkbox',
              required: field.allRequired
            });
          });
        }
      } else if (field.type === 'terms-display') {
        // Terms display doesn't need a form control
        continue;
      } else if (field.type === 'address-group' && field.subFields) {
        // Create controls for each address subfield
        for (const subField of field.subFields) {
          group[subField.id] = this.createControl(subField);
        }
      } else {
        group[field.id] = this.createControl(field, dataset);
      }
    }
  }

  /**
   * Create a FormControl from field configuration
   */
  private createControl(field: FieldConfig, dataset?: DatasetConfig): FormControl {
    const validators = this.validatorFactory.createValidators(field.validators);

    // Add required validator if field is marked required
    if (field.required && !validators.some(v => v === Validators.required)) {
      if (field.type === 'checkbox' && field.required) {
        validators.push(Validators.requiredTrue);
      } else {
        validators.push(Validators.required);
      }
    }

    // Add blacklist validator from dataset if applicable
    if (field.type === 'email' && dataset?.blockedEmails?.length) {
      const blacklistValidator = this.validatorFactory.createValidators([
        { type: 'blacklist', value: dataset.blockedEmails }
      ]);
      validators.push(...blacklistValidator);
    }

    const defaultValue = this.getDefaultValue(field);

    return new FormControl(
      { value: defaultValue, disabled: field.disabled || false },
      validators
    );
  }

  /**
   * Get the default value for a field based on its type
   */
  private getDefaultValue(field: FieldConfig): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    switch (field.type) {
      case 'checkbox':
        return false;
      case 'select':
        return null;
      default:
        return '';
    }
  }

  /**
   * Add dynamic controls to an existing form
   * Useful for adding agreement checkboxes after dataset selection
   */
  addDynamicControls(
    form: FormGroup,
    field: FieldConfig,
    items: string[]
  ): void {
    items.forEach((_, index) => {
      const controlId = `${field.id}_${index}`;
      if (!form.contains(controlId)) {
        const control = new FormControl(false, field.allRequired ? Validators.requiredTrue : []);
        form.addControl(controlId, control);
      }
    });
  }

  /**
   * Remove dynamic controls from a form
   */
  removeDynamicControls(form: FormGroup, fieldIdPrefix: string): void {
    Object.keys(form.controls).forEach(key => {
      if (key.startsWith(fieldIdPrefix + '_')) {
        form.removeControl(key);
      }
    });
  }

  /**
   * Reset form to default values
   */
  resetForm(form: FormGroup, formConfig: FormConfig): void {
    const defaultValues: Record<string, any> = {};

    for (const section of formConfig.sections) {
      for (const field of section.fields) {
        if (field.type !== 'terms-display') {
          defaultValues[field.id] = this.getDefaultValue(field);
        }
      }
    }

    form.reset(defaultValues);
  }

  /**
   * Get all values from form, handling dynamic controls
   */
  getFormValues(form: FormGroup): Record<string, any> {
    const values: Record<string, any> = {};
    const dynamicGroups: Record<string, any[]> = {};

    Object.entries(form.controls).forEach(([key, control]) => {
      // Check if this is a dynamic control (contains underscore with number)
      const match = key.match(/^(.+)_(\d+)$/);
      if (match) {
        const [, baseId, index] = match;
        if (!dynamicGroups[baseId]) {
          dynamicGroups[baseId] = [];
        }
        dynamicGroups[baseId][parseInt(index, 10)] = control.value;
      } else {
        values[key] = control.value;
      }
    });

    // Merge dynamic groups into values
    Object.entries(dynamicGroups).forEach(([baseId, groupValues]) => {
      values[baseId] = groupValues;
    });

    return values;
  }
}
