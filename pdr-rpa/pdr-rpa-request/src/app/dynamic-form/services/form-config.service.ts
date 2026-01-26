import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { parse } from 'yaml';
import {
  AppFormConfig,
  FormConfig,
  DatasetConfig,
  getFormById,
  getDatasetById
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {
  private configUrl = environment.formConfigUrl || 'assets/form-config.yaml';
  private configCache$: Observable<AppFormConfig> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Load and parse the form configuration file
   * Results are cached to avoid multiple requests
   */
  loadConfig(): Observable<AppFormConfig> {
    if (!this.configCache$) {
      this.configCache$ = this.http.get(this.configUrl, { responseType: 'text' }).pipe(
        map(yamlContent => {
          const parsed = parse(yamlContent) as AppFormConfig;
          return this.validateConfig(parsed);
        }),
        tap(config => {
          if (environment.debug) {
            console.log('[FormConfigService] Loaded config:', config);
          }
        }),
        shareReplay(1),
        catchError(error => {
          console.error('[FormConfigService] Failed to load config:', error);
          return throwError(() => new Error('Failed to load form configuration'));
        })
      );
    }
    return this.configCache$;
  }

  /**
   * Get a specific form configuration by ID
   */
  getForm(formId: string): Observable<FormConfig | undefined> {
    return this.loadConfig().pipe(
      map(config => getFormById(config, formId))
    );
  }

  /**
   * Get all form configurations
   */
  getForms(): Observable<FormConfig[]> {
    return this.loadConfig().pipe(
      map(config => config.forms)
    );
  }

  /**
   * Get a specific dataset configuration by ID
   */
  getDataset(datasetId: string): Observable<DatasetConfig | undefined> {
    return this.loadConfig().pipe(
      map(config => getDatasetById(config, datasetId))
    );
  }

  /**
   * Get all dataset configurations
   */
  getDatasets(): Observable<DatasetConfig[]> {
    return this.loadConfig().pipe(
      map(config => config.datasets)
    );
  }

  /**
   * Get global settings
   */
  getSettings(): Observable<AppFormConfig['settings']> {
    return this.loadConfig().pipe(
      map(config => config.settings)
    );
  }

  /**
   * Clear the configuration cache (useful for testing or config reload)
   */
  clearCache(): void {
    this.configCache$ = null;
  }

  /**
   * Validate the configuration structure
   */
  private validateConfig(config: AppFormConfig): AppFormConfig {
    if (!config.forms || !Array.isArray(config.forms)) {
      throw new Error('Configuration must contain a "forms" array');
    }

    if (!config.datasets || !Array.isArray(config.datasets)) {
      throw new Error('Configuration must contain a "datasets" array');
    }

    // Validate each form
    for (const form of config.forms) {
      if (!form.id) {
        throw new Error('Each form must have an "id" property');
      }
      if (!form.sections || !Array.isArray(form.sections)) {
        throw new Error(`Form "${form.id}" must have a "sections" array`);
      }

      // Validate sections
      for (const section of form.sections) {
        if (!section.id) {
          throw new Error(`Each section in form "${form.id}" must have an "id" property`);
        }
        if (!section.fields || !Array.isArray(section.fields)) {
          throw new Error(`Section "${section.id}" in form "${form.id}" must have a "fields" array`);
        }

        // Validate fields
        for (const field of section.fields) {
          if (!field.id) {
            throw new Error(`Each field in section "${section.id}" must have an "id" property`);
          }
          if (!field.type) {
            throw new Error(`Field "${field.id}" must have a "type" property`);
          }
        }
      }
    }

    // Validate each dataset
    for (const dataset of config.datasets) {
      if (!dataset.id) {
        throw new Error('Each dataset must have an "id" property');
      }
      if (!dataset.name) {
        throw new Error(`Dataset "${dataset.id}" must have a "name" property`);
      }
    }

    return config;
  }

  /**
   * Get form with dataset-specific customizations applied
   */
  getFormForDataset(formId: string, datasetId: string): Observable<{ form: FormConfig; dataset: DatasetConfig } | null> {
    return this.loadConfig().pipe(
      map(config => {
        const form = getFormById(config, formId);
        const dataset = getDatasetById(config, datasetId);

        if (!form || !dataset) {
          return null;
        }

        return { form, dataset };
      })
    );
  }
}
