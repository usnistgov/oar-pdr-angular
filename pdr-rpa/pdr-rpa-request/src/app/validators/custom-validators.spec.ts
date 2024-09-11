import { AbstractControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('nonLatinCharacters', () => {
    const validatorFn = CustomValidators.nonLatinCharacters();

    it('should return null for empty value', () => {
      const control = { value: '' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toBeNull();
    });

    it('should return null for value with only printable ASCII characters and spaces', () => {
      const control = { value: 'Hello World! 123' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toBeNull();
    });

    it('should return error for value with Chinese characters', () => {
      const control = { value: '你好' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Japanese characters', () => {
      const control = { value: 'こんにちは' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Korean characters', () => {
      const control = { value: '안녕하세요' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Cyrillic characters', () => {
      const control = { value: 'Привет' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Greek characters', () => {
      const control = { value: 'Γεια σας' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Hebrew characters', () => {
      const control = { value: 'שלום' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Arabic characters', () => {
      const control = { value: 'مرحبا' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Thai characters', () => {
      const control = { value: 'สวัสดีครับ' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with Devanagari characters', () => {
      const control = { value: 'नमस्ते' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });

    it('should return error for value with mixed ASCII and non-Latin characters', () => {
      const control = { value: 'Hello Привет 123 สวัสดีครับ' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ nonLatin: true });
    });
  });

  describe('blacklisted', () => {
    const blacklistedPatterns = ['test', '123'];
    const validatorFn = CustomValidators.blacklisted(blacklistedPatterns);

    it('should return null for empty value', () => {
      const control = { value: '' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toBeNull();
    });

    it('should return null for value that does not match any blacklisted pattern', () => {
      const control = { value: 'hello.world@example.org' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toBeNull();
    });

    it('should return error for value that matches a blacklisted pattern', () => {
      const control = { value: 'this is a test' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ blacklisted: 'pattern' });
    });

    it('should return error for value that contains a blacklisted pattern', () => {
      const control = { value: 'abc123def' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toEqual({ blacklisted: 'pattern' });
    });

    it('should return null for value that matches a substring not covered by a pattern', () => {
      const control = { value: 'this is a safe string' } as AbstractControl;
      const result = validatorFn(control);
      expect(result).toBeNull();
    });
  });
});
