import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ValidatorFactoryService } from './validator-factory.service';
import { ValidatorConfig } from '../models';

describe('ValidatorFactoryService', () => {
  let service: ValidatorFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidatorFactoryService]
    });
    service = TestBed.inject(ValidatorFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createValidators', () => {
    it('should return empty array for undefined configs', () => {
      const validators = service.createValidators(undefined);
      expect(validators).toEqual([]);
    });

    it('should return empty array for empty configs', () => {
      const validators = service.createValidators([]);
      expect(validators).toEqual([]);
    });

    it('should create multiple validators from configs', () => {
      const configs: ValidatorConfig[] = [
        { type: 'required' },
        { type: 'minLength', value: 3 }
      ];
      const validators = service.createValidators(configs);
      expect(validators.length).toBe(2);
    });
  });

  describe('required validator', () => {
    it('should create required validator', () => {
      const configs: ValidatorConfig[] = [{ type: 'required' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toEqual({ required: true });
    });

    it('should pass required validator with value', () => {
      const configs: ValidatorConfig[] = [{ type: 'required' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('test');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('requiredTrue validator', () => {
    it('should fail for false value', () => {
      const configs: ValidatorConfig[] = [{ type: 'requiredTrue' }];
      const validators = service.createValidators(configs);

      const control = new FormControl(false);
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toEqual({ required: true });
    });

    it('should pass for true value', () => {
      const configs: ValidatorConfig[] = [{ type: 'requiredTrue' }];
      const validators = service.createValidators(configs);

      const control = new FormControl(true);
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('email validator', () => {
    it('should fail for invalid email', () => {
      const configs: ValidatorConfig[] = [{ type: 'email' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('invalid-email');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors?.['email']).toBeTruthy();
    });

    it('should pass for valid email', () => {
      const configs: ValidatorConfig[] = [{ type: 'email' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('test@example.com');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('minLength validator', () => {
    it('should fail for short string', () => {
      const configs: ValidatorConfig[] = [{ type: 'minLength', value: 5 }];
      const validators = service.createValidators(configs);

      const control = new FormControl('abc');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors?.['minlength']).toBeTruthy();
    });

    it('should pass for long enough string', () => {
      const configs: ValidatorConfig[] = [{ type: 'minLength', value: 5 }];
      const validators = service.createValidators(configs);

      const control = new FormControl('abcdef');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should skip if value is not a number', () => {
      const configs: ValidatorConfig[] = [{ type: 'minLength', value: 'invalid' as any }];
      const validators = service.createValidators(configs);
      expect(validators.length).toBe(0);
    });
  });

  describe('maxLength validator', () => {
    it('should fail for long string', () => {
      const configs: ValidatorConfig[] = [{ type: 'maxLength', value: 5 }];
      const validators = service.createValidators(configs);

      const control = new FormControl('abcdefgh');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors?.['maxlength']).toBeTruthy();
    });

    it('should pass for short enough string', () => {
      const configs: ValidatorConfig[] = [{ type: 'maxLength', value: 5 }];
      const validators = service.createValidators(configs);

      const control = new FormControl('abc');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('pattern validator', () => {
    it('should use predefined latin-only pattern', () => {
      const configs: ValidatorConfig[] = [{ type: 'pattern', value: 'latin-only' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('Hello World');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should fail latin-only pattern for non-ASCII', () => {
      const configs: ValidatorConfig[] = [{ type: 'pattern', value: 'latin-only' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('Hello 世界');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors?.['pattern']).toBeTruthy();
    });

    it('should use predefined numeric pattern', () => {
      const configs: ValidatorConfig[] = [{ type: 'pattern', value: 'numeric' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('12345');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should use custom pattern string', () => {
      const configs: ValidatorConfig[] = [{ type: 'pattern', value: '^[A-Z]+$' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('ABC');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('blacklist validator', () => {
    it('should fail for blacklisted pattern', () => {
      const configs: ValidatorConfig[] = [
        { type: 'blacklist', value: ['@gmail\\.', '@yahoo\\.'] }
      ];
      const validators = service.createValidators(configs);

      const control = new FormControl('user@gmail.com');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toEqual({ blacklisted: true });
    });

    it('should pass for non-blacklisted value', () => {
      const configs: ValidatorConfig[] = [
        { type: 'blacklist', value: ['@gmail\\.', '@yahoo\\.'] }
      ];
      const validators = service.createValidators(configs);

      const control = new FormControl('user@company.com');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should handle empty value', () => {
      const configs: ValidatorConfig[] = [
        { type: 'blacklist', value: ['@gmail\\.'] }
      ];
      const validators = service.createValidators(configs);

      const control = new FormControl('');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should skip if value is not array', () => {
      const configs: ValidatorConfig[] = [{ type: 'blacklist', value: 'invalid' as any }];
      const validators = service.createValidators(configs);
      expect(validators.length).toBe(0);
    });
  });

  describe('latinOnly validator', () => {
    it('should pass for ASCII characters', () => {
      const configs: ValidatorConfig[] = [{ type: 'latinOnly' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('Hello World 123!');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });

    it('should fail for non-ASCII characters', () => {
      const configs: ValidatorConfig[] = [{ type: 'latinOnly' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('Привет');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toEqual({ nonLatin: true });
    });

    it('should handle empty value', () => {
      const configs: ValidatorConfig[] = [{ type: 'latinOnly' }];
      const validators = service.createValidators(configs);

      const control = new FormControl('');
      control.setValidators(validators);
      control.updateValueAndValidity();

      expect(control.errors).toBeNull();
    });
  });

  describe('unknown validator type', () => {
    it('should skip unknown validator types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const configs: ValidatorConfig[] = [{ type: 'unknown' as any }];
      const validators = service.createValidators(configs);

      expect(validators.length).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Unknown validator type: unknown');

      consoleSpy.mockRestore();
    });
  });

  describe('getErrorMessage', () => {
    it('should return custom message if provided', () => {
      const customMessages = { required: 'Name is required' };
      const message = service.getErrorMessage('required', true, customMessages);
      expect(message).toBe('Name is required');
    });

    it('should return default required message', () => {
      const message = service.getErrorMessage('required', true);
      expect(message).toBe('This field is required');
    });

    it('should return default email message', () => {
      const message = service.getErrorMessage('email', true);
      expect(message).toBe('Please enter a valid email address');
    });

    it('should return minlength message with length', () => {
      const message = service.getErrorMessage('minlength', { requiredLength: 5 });
      expect(message).toBe('Minimum length is 5 characters');
    });

    it('should return maxlength message with length', () => {
      const message = service.getErrorMessage('maxlength', { requiredLength: 100 });
      expect(message).toBe('Maximum length is 100 characters');
    });

    it('should return blacklisted message', () => {
      const message = service.getErrorMessage('blacklisted', true);
      expect(message).toBe('This value is not allowed');
    });

    it('should return nonLatin message', () => {
      const message = service.getErrorMessage('nonLatin', true);
      expect(message).toBe('Only Latin characters are allowed');
    });

    it('should return generic message for unknown error', () => {
      const message = service.getErrorMessage('unknownError', true);
      expect(message).toBe('Invalid value');
    });
  });
});
