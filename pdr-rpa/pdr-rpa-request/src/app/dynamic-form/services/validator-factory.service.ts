import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { ValidatorConfig } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ValidatorFactoryService {

  /**
   * Creates an array of Angular validators from validator configurations
   */
  createValidators(configs: ValidatorConfig[] | undefined): ValidatorFn[] {
    if (!configs || configs.length === 0) {
      return [];
    }

    return configs
      .map(config => this.createValidator(config))
      .filter((v): v is ValidatorFn => v !== null);
  }

  /**
   * Creates a single Angular validator from configuration
   */
  private createValidator(config: ValidatorConfig): ValidatorFn | null {
    switch (config.type) {
      case 'required':
        return Validators.required;

      case 'requiredTrue':
        return Validators.requiredTrue;

      case 'email':
        return Validators.email;

      case 'minLength':
        if (typeof config.value === 'number') {
          return Validators.minLength(config.value);
        }
        return null;

      case 'maxLength':
        if (typeof config.value === 'number') {
          return Validators.maxLength(config.value);
        }
        return null;

      case 'pattern':
        if (typeof config.value === 'string') {
          // Handle predefined patterns
          const pattern = this.getPattern(config.value);
          return Validators.pattern(pattern);
        }
        return null;

      case 'blacklist':
        if (Array.isArray(config.value)) {
          return this.blacklistValidator(config.value);
        }
        return null;

      case 'latinOnly':
        return this.latinOnlyValidator();

      default:
        console.warn(`Unknown validator type: ${config.type}`);
        return null;
    }
  }

  /**
   * Get predefined pattern or return the string as-is
   */
  private getPattern(patternName: string): string | RegExp {
    const patterns: Record<string, RegExp> = {
      'latin-only': /^[\x20-\x7E]*$/,
      'alpha': /^[a-zA-Z]*$/,
      'alphanumeric': /^[a-zA-Z0-9]*$/,
      'numeric': /^[0-9]*$/,
      'phone': /^[\d\s\-\+\(\)]*$/,
    };

    return patterns[patternName] || patternName;
  }

  /**
   * Validator that checks if value matches any blacklisted pattern
   */
  private blacklistValidator(patterns: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().toLowerCase();

      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(value)) {
            return { blacklisted: true };
          }
        } catch (e) {
          console.warn(`Invalid blacklist pattern: ${pattern}`);
        }
      }

      return null;
    };
  }

  /**
   * Validator that only allows Latin (ASCII printable) characters
   */
  private latinOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        return null;
      }

      // ASCII printable characters range: 0x20 (space) to 0x7E (~)
      const latinOnlyRegex = /^[\x20-\x7E]*$/;

      if (!latinOnlyRegex.test(control.value)) {
        return { nonLatin: true };
      }

      return null;
    };
  }

  /**
   * Get error message for a validation error
   */
  getErrorMessage(
    errorKey: string,
    errorValue: any,
    customMessages?: Record<string, string>
  ): string {
    // Check custom messages first
    if (customMessages && customMessages[errorKey]) {
      return customMessages[errorKey];
    }

    // Default messages
    const defaultMessages: Record<string, string | ((val: any) => string)> = {
      required: 'This field is required',
      requiredTrue: 'You must accept this agreement',
      email: 'Please enter a valid email address',
      minlength: (val) => `Minimum length is ${val.requiredLength} characters`,
      maxlength: (val) => `Maximum length is ${val.requiredLength} characters`,
      pattern: 'Invalid format',
      blacklisted: 'This value is not allowed',
      nonLatin: 'Only Latin characters are allowed',
    };

    const message = defaultMessages[errorKey];
    if (typeof message === 'function') {
      return message(errorValue);
    }

    return message || 'Invalid value';
  }
}
