/**
 * Supported field types for dynamic forms
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio'
  | 'recaptcha'
  | 'terms-display'
  | 'disclaimer-display'
  | 'address-group'
  | 'hidden';

/**
 * Validator configuration for a field
 */
export interface ValidatorConfig {
  type: 'required' | 'requiredTrue' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'blacklist' | 'latinOnly';
  value?: string | number | string[];
  message?: string;
}

/**
 * Option for select/radio fields
 */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

/**
 * Configuration for a single form field
 */
export interface FieldConfig {
  /** Unique identifier for the field */
  id: string;

  /** Type of form control to render */
  type: FieldType;

  /** Display label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Helper text shown below the field */
  hint?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Default value */
  defaultValue?: any;

  /** Validators to apply */
  validators?: ValidatorConfig[];

  /** Custom error messages keyed by validator type */
  errorMessages?: Record<string, string>;

  /** Options for select/radio/checkbox-group fields */
  options?: FieldOption[];

  /** Source for dynamic options (e.g., 'countries', 'dataset.terms') */
  optionsSource?: string;

  /** Blacklist filter for options (e.g., blocked countries) */
  filterBlacklist?: string[];

  /** CSS classes to apply */
  cssClass?: string;

  /** Width configuration (e.g., 'full', 'half', 'third') */
  width?: 'full' | 'half' | 'third' | 'quarter';

  /** Whether to show this field (can be expression) */
  visible?: boolean | string;

  /** Order for rendering */
  order?: number;

  /** For checkbox-group: whether all must be checked */
  allRequired?: boolean;

  /** For terms-display: content source */
  content?: string[];

  /** For address-group: sub-field configurations */
  subFields?: FieldConfig[];

  /** Autocomplete attribute value */
  autocomplete?: string;

  /** Maximum character count for text/textarea */
  maxChars?: number;

  /** Number of rows for textarea */
  rows?: number;
}

/**
 * Type guard to check if field has options
 */
export function hasOptions(field: FieldConfig): boolean {
  return field.type === 'select' || field.type === 'radio' || field.type === 'checkbox-group';
}

/**
 * Type guard to check if field is a text input variant
 */
export function isTextInput(field: FieldConfig): boolean {
  return field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'textarea';
}
