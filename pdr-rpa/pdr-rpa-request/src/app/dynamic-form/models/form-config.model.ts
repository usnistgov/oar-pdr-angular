import { FieldConfig } from './field-config.model';

/**
 * Configuration for a form section
 */
export interface SectionConfig {
  /** Unique identifier for the section */
  id: string;

  /** Section title (optional) */
  title?: string;

  /** Section description/subtitle */
  description?: string;

  /** Fields within this section */
  fields: FieldConfig[];

  /** CSS classes for the section */
  cssClass?: string;

  /** Whether section is collapsible */
  collapsible?: boolean;

  /** Whether section starts expanded (if collapsible) */
  expanded?: boolean;

  /** Order for rendering */
  order?: number;

  /** Condition for showing this section */
  visible?: boolean | string;
}

/**
 * Configuration for an entire form
 */
export interface FormConfig {
  /** Unique identifier for the form */
  id: string;

  /** Form title */
  title: string;

  /** Form subtitle */
  subtitle?: string;

  /** Form description text */
  description?: string;

  /** Sections within the form */
  sections: SectionConfig[];

  /** Submit button configuration */
  submitButton?: {
    label: string;
    icon?: string;
    cssClass?: string;
  };

  /** Cancel button configuration */
  cancelButton?: {
    label: string;
    show: boolean;
  };

  /** Success message after submission */
  successMessage?: string;

  /** Error message on submission failure */
  errorMessage?: string;

  /** CSS classes for the form */
  cssClass?: string;
}

/**
 * Dataset-specific configuration
 */
export interface DatasetConfig {
  /** Dataset identifier (ediid) */
  id: string;

  /** Display name */
  name: string;

  /** Description (can contain HTML) */
  description: string;

  /** URL to dataset page */
  url: string;

  /** Terms of use */
  terms: string[];

  /** Agreements that must be accepted */
  agreements: string[];

  /** Disclaimers to display */
  disclaimers?: string[];

  /** Whether dataset requires approval */
  requiresApproval: boolean;

  /** Blocked email patterns (regex) */
  blockedEmails?: string[];

  /** Blocked country names */
  blockedCountries?: string[];

  /** Reference to form template ID */
  formId?: string;
}

/**
 * Root configuration file structure
 */
export interface AppFormConfig {
  /** Form definitions */
  forms: FormConfig[];

  /** Dataset definitions */
  datasets: DatasetConfig[];

  /** Global settings */
  settings?: {
    /** URL for countries data */
    countriesUrl?: string;

    /** reCAPTCHA site key */
    recaptchaSiteKey?: string;

    /** API base URL */
    apiBaseUrl?: string;
  };
}

/**
 * Helper to get a form by ID
 */
export function getFormById(config: AppFormConfig, formId: string): FormConfig | undefined {
  return config.forms.find(f => f.id === formId);
}

/**
 * Helper to get a dataset by ID
 */
export function getDatasetById(config: AppFormConfig, datasetId: string): DatasetConfig | undefined {
  return config.datasets.find(d => d.id === datasetId);
}

/**
 * Get all fields from a form config (flattened)
 */
export function getAllFields(form: FormConfig): FieldConfig[] {
  return form.sections.reduce<FieldConfig[]>(
    (acc, section) => [...acc, ...section.fields],
    []
  );
}
