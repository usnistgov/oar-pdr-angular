import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicFormBuilderService } from './form-builder.service';
import { ValidatorFactoryService } from './validator-factory.service';
import { FormConfig, DatasetConfig, FieldConfig } from '../models';

describe('DynamicFormBuilderService', () => {
  let service: DynamicFormBuilderService;

  const mockFormConfig: FormConfig = {
    id: 'test-form',
    title: 'Test Form',
    sections: [
      {
        id: 'contact',
        title: 'Contact Info',
        fields: [
          { id: 'fullName', type: 'text', label: 'Full Name', required: true },
          { id: 'email', type: 'email', label: 'Email', required: true },
          { id: 'phone', type: 'tel', label: 'Phone', required: false }
        ]
      }
    ]
  };

  const mockDataset: DatasetConfig = {
    id: 'test-dataset',
    name: 'Test Dataset',
    description: 'Test description',
    url: 'https://example.com',
    terms: ['Term 1', 'Term 2'],
    agreements: ['Agreement 1', 'Agreement 2'],
    requiresApproval: true,
    blockedEmails: ['@gmail\\.com', '@yahoo\\.com'],
    blockedCountries: ['Cuba', 'Iran']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicFormBuilderService, ValidatorFactoryService]
    });
    service = TestBed.inject(DynamicFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildForm', () => {
    it('should create a FormGroup from config', () => {
      const form = service.buildForm(mockFormConfig);

      expect(form).toBeInstanceOf(FormGroup);
      expect(form.get('fullName')).toBeTruthy();
      expect(form.get('email')).toBeTruthy();
      expect(form.get('phone')).toBeTruthy();
    });

    it('should add required validator for required fields', () => {
      const form = service.buildForm(mockFormConfig);

      const fullNameControl = form.get('fullName');
      fullNameControl?.setValue('');
      fullNameControl?.updateValueAndValidity();

      expect(fullNameControl?.errors?.['required']).toBeTruthy();
    });

    it('should not add required validator for optional fields', () => {
      const form = service.buildForm(mockFormConfig);

      const phoneControl = form.get('phone');
      phoneControl?.setValue('');
      phoneControl?.updateValueAndValidity();

      expect(phoneControl?.errors).toBeNull();
    });

    it('should add email blacklist validator from dataset', () => {
      const form = service.buildForm(mockFormConfig, mockDataset);

      const emailControl = form.get('email');
      emailControl?.setValue('user@gmail.com');
      emailControl?.updateValueAndValidity();

      expect(emailControl?.errors?.['blacklisted']).toBeTruthy();
    });

    it('should pass email validation for non-blacklisted domain', () => {
      const form = service.buildForm(mockFormConfig, mockDataset);

      const emailControl = form.get('email');
      emailControl?.setValue('user@company.com');
      emailControl?.updateValueAndValidity();

      expect(emailControl?.errors?.['blacklisted']).toBeFalsy();
    });
  });

  describe('checkbox-group handling', () => {
    it('should create dynamic controls for agreements', () => {
      const configWithAgreements: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'agreements',
          fields: [{
            id: 'agreements',
            type: 'checkbox-group',
            label: 'Agreements',
            optionsSource: 'dataset.agreements',
            allRequired: true
          }]
        }]
      };

      const form = service.buildForm(configWithAgreements, mockDataset);

      expect(form.get('agreements_0')).toBeTruthy();
      expect(form.get('agreements_1')).toBeTruthy();
    });

    it('should add requiredTrue validator for required agreement checkboxes', () => {
      const configWithAgreements: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'agreements',
          fields: [{
            id: 'agreements',
            type: 'checkbox-group',
            label: 'Agreements',
            optionsSource: 'dataset.agreements',
            allRequired: true
          }]
        }]
      };

      const form = service.buildForm(configWithAgreements, mockDataset);

      const control = form.get('agreements_0');
      control?.setValue(false);
      control?.updateValueAndValidity();

      expect(control?.errors?.['required']).toBeTruthy();
    });
  });

  describe('terms-display handling', () => {
    it('should not create control for terms-display field', () => {
      const configWithTerms: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'terms',
          fields: [{
            id: 'termsDisplay',
            type: 'terms-display',
            label: 'Terms'
          }]
        }]
      };

      const form = service.buildForm(configWithTerms);

      expect(form.get('termsDisplay')).toBeNull();
    });
  });

  describe('address-group handling', () => {
    it('should create controls for address subfields', () => {
      const configWithAddress: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'address',
          fields: [{
            id: 'address',
            type: 'address-group',
            label: 'Address',
            subFields: [
              { id: 'address1', type: 'text', label: 'Street', required: true },
              { id: 'address2', type: 'text', label: 'Unit' },
              { id: 'city', type: 'text', label: 'City', required: true }
            ]
          }]
        }]
      };

      const form = service.buildForm(configWithAddress);

      expect(form.get('address1')).toBeTruthy();
      expect(form.get('address2')).toBeTruthy();
      expect(form.get('city')).toBeTruthy();
    });
  });

  describe('default values', () => {
    it('should use defaultValue from field config', () => {
      const configWithDefaults: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'section1',
          fields: [{
            id: 'country',
            type: 'select',
            label: 'Country',
            defaultValue: 'United States'
          }]
        }]
      };

      const form = service.buildForm(configWithDefaults);

      expect(form.get('country')?.value).toBe('United States');
    });

    it('should default checkbox to false', () => {
      const configWithCheckbox: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'section1',
          fields: [{
            id: 'subscribe',
            type: 'checkbox',
            label: 'Subscribe'
          }]
        }]
      };

      const form = service.buildForm(configWithCheckbox);

      expect(form.get('subscribe')?.value).toBe(false);
    });

    it('should default select to null', () => {
      const configWithSelect: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'section1',
          fields: [{
            id: 'country',
            type: 'select',
            label: 'Country'
          }]
        }]
      };

      const form = service.buildForm(configWithSelect);

      expect(form.get('country')?.value).toBeNull();
    });

    it('should default text to empty string', () => {
      const configWithText: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'section1',
          fields: [{
            id: 'name',
            type: 'text',
            label: 'Name'
          }]
        }]
      };

      const form = service.buildForm(configWithText);

      expect(form.get('name')?.value).toBe('');
    });
  });

  describe('addDynamicControls', () => {
    it('should add dynamic controls to existing form', () => {
      const form = new FormGroup<Record<string, FormControl>>({});
      const field: FieldConfig = {
        id: 'items',
        type: 'checkbox-group',
        label: 'Items',
        allRequired: true
      };

      service.addDynamicControls(form, field, ['Item 1', 'Item 2', 'Item 3']);

      expect(form.get('items_0')).toBeTruthy();
      expect(form.get('items_1')).toBeTruthy();
      expect(form.get('items_2')).toBeTruthy();
    });

    it('should not duplicate existing controls', () => {
      const form = new FormGroup<Record<string, FormControl>>({});
      const field: FieldConfig = {
        id: 'items',
        type: 'checkbox-group',
        label: 'Items'
      };

      service.addDynamicControls(form, field, ['Item 1']);
      service.addDynamicControls(form, field, ['Item 1']); // Call again

      expect(Object.keys(form.controls).length).toBe(1);
    });
  });

  describe('removeDynamicControls', () => {
    it('should remove controls with matching prefix', () => {
      const form = new FormGroup<Record<string, FormControl>>({});
      const field: FieldConfig = {
        id: 'items',
        type: 'checkbox-group',
        label: 'Items'
      };

      service.addDynamicControls(form, field, ['Item 1', 'Item 2']);
      expect(form.get('items_0')).toBeTruthy();

      service.removeDynamicControls(form, 'items');

      expect(form.get('items_0')).toBeNull();
      expect(form.get('items_1')).toBeNull();
    });
  });

  describe('resetForm', () => {
    it('should reset form to default values', () => {
      const form = service.buildForm(mockFormConfig);

      // Fill in values
      form.get('fullName')?.setValue('John Doe');
      form.get('email')?.setValue('john@example.com');
      form.get('phone')?.setValue('555-1234');

      service.resetForm(form, mockFormConfig);

      expect(form.get('fullName')?.value).toBe('');
      expect(form.get('email')?.value).toBe('');
      expect(form.get('phone')?.value).toBe('');
    });
  });

  describe('getFormValues', () => {
    it('should return all form values', () => {
      const form = service.buildForm(mockFormConfig);

      form.get('fullName')?.setValue('John Doe');
      form.get('email')?.setValue('john@example.com');
      form.get('phone')?.setValue('555-1234');

      const values = service.getFormValues(form);

      expect(values['fullName']).toBe('John Doe');
      expect(values['email']).toBe('john@example.com');
      expect(values['phone']).toBe('555-1234');
    });

    it('should group dynamic controls into arrays', () => {
      const form = new FormGroup<Record<string, FormControl>>({});
      const field: FieldConfig = {
        id: 'agreements',
        type: 'checkbox-group',
        label: 'Agreements'
      };

      service.addDynamicControls(form, field, ['A', 'B', 'C']);
      form.get('agreements_0')?.setValue(true);
      form.get('agreements_1')?.setValue(false);
      form.get('agreements_2')?.setValue(true);

      const values = service.getFormValues(form);

      expect(values['agreements']).toEqual([true, false, true]);
    });
  });

  describe('disabled fields', () => {
    it('should create disabled control when field is disabled', () => {
      const configWithDisabled: FormConfig = {
        id: 'test-form',
        title: 'Test',
        sections: [{
          id: 'section1',
          fields: [{
            id: 'readonly',
            type: 'text',
            label: 'Read Only',
            disabled: true
          }]
        }]
      };

      const form = service.buildForm(configWithDisabled);

      expect(form.get('readonly')?.disabled).toBe(true);
    });
  });
});
