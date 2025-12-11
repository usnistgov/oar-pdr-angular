# PDR RPA Request Form

Angular application for requesting access to restricted public datasets in the NIST Public Data Repository.

## Features

- **Config-driven forms**: Form fields, sections, and validation rules defined in YAML
- **Angular Material UI**: Modern, accessible form components with dark mode support
- **Dynamic validation**: Email blacklists, country restrictions, custom patterns per dataset
- **reCAPTCHA integration**: Bot protection for form submissions

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/usnistgov/oar-pdr-angular.git
cd oar-pdr-angular

# Initialize submodules (required for oarng library)
git submodule update --init --recursive

# Install dependencies from root
npm install --legacy-peer-deps

# Build required libraries
cd lib && npx ng build oarng && cd ..
cd oar-lps && npx ng build oarlps && cd ..

# Run the application
cd pdr-rpa/pdr-rpa-request
npx ng serve --port 4201
```

Open http://localhost:4201/?ediid=ark:/88434/mds2-2909 in your browser.

### Running Tests

```bash
cd pdr-rpa/pdr-rpa-request
npx jest
```

## Architecture

```
src/app/
├── dynamic-form/                    # Dynamic form module
│   ├── models/                      # TypeScript interfaces
│   │   ├── field-config.model.ts    # Field definitions
│   │   └── form-config.model.ts     # Form/section/dataset definitions
│   ├── services/
│   │   ├── form-config.service.ts   # Loads YAML config
│   │   ├── form-builder.service.ts  # Builds FormGroup from config
│   │   └── validator-factory.service.ts  # Creates validators
│   └── components/
│       ├── dynamic-form/            # Main form container
│       ├── dynamic-field/           # Field type router
│       ├── form-section/            # Section wrapper
│       └── fields/                  # Individual field components
├── app.component.ts                 # Main app, handles submission
└── assets/
    └── form-config.yaml             # Form configuration
```

## Configuration

All form configuration lives in `src/assets/form-config.yaml`.

### Structure Overview

```yaml
forms:
  - id: "rpa-request"
    title: "Access Request Form"
    sections:
      - id: "contact"
        title: "Contact Information"
        fields:
          - id: "fullName"
            type: "text"
            label: "Full Name"
            required: true

datasets:
  - id: "ark:/88434/mds2-2909"
    name: "NIST Dataset Name"
    terms: [...]
    agreements: [...]
    blockedEmails: [...]

settings:
  countriesUrl: "assets/countries.json"
  recaptchaSiteKey: "your-site-key"
```

## Adding a New Dataset

1. Open `src/assets/form-config.yaml`
2. Add a new entry to the `datasets` array:

```yaml
datasets:
  # ... existing datasets ...

  - id: "ark:/88434/your-new-id"
    name: "Your Dataset Name"
    description: "Brief description of the dataset"
    url: "https://data.nist.gov/od/id/your-new-id"
    terms:
      - "Data must be used for research purposes only."
      - "No redistribution without permission."
    agreements:
      - "I agree to the terms of use."
      - "I will cite NIST in any publications."
    requiresApproval: true
    blockedEmails:
      - "@gmail\\."
      - "@yahoo\\."
    blockedCountries:
      - "Cuba"
      - "Iran"
```

3. Access via: `http://localhost:4201/?ediid=ark:/88434/your-new-id`

### Dataset Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (ediid from PDR) |
| `name` | Yes | Display name |
| `description` | No | HTML description |
| `url` | No | Link to dataset page |
| `terms` | Yes | Array of terms user must acknowledge |
| `agreements` | Yes | Checkboxes user must check |
| `requiresApproval` | Yes | Whether manual approval is needed |
| `blockedEmails` | No | Regex patterns for blocked email domains |
| `blockedCountries` | No | Country names to exclude from dropdown |
| `disclaimers` | No | Warning messages to display |

## Adding a New Form Template

Forms define the structure and fields. To create a new form:

1. Add to the `forms` array in `form-config.yaml`:

```yaml
forms:
  - id: "my-custom-form"
    title: "Custom Request Form"
    subtitle: "For Special Access"
    sections:
      - id: "personal"
        title: "Personal Information"
        fields:
          - id: "fullName"
            type: "text"
            label: "Full Name"
            placeholder: "Enter your name"
            required: true
            validators:
              - type: "minLength"
                value: 2
              - type: "latinOnly"
            errorMessages:
              required: "Name is required"
              minLength: "At least 2 characters"

      - id: "contact"
        title: "Contact Details"
        fields:
          - id: "email"
            type: "email"
            label: "Email Address"
            required: true

          - id: "country"
            type: "select"
            label: "Country"
            required: true
            optionsSource: "countries"
```

2. Reference the form in your dataset:

```yaml
datasets:
  - id: "ark:/88434/special-dataset"
    formId: "my-custom-form"  # References the form above
    # ... other dataset config
```

### Available Field Types

| Type | Description | Special Properties |
|------|-------------|-------------------|
| `text` | Single-line text input | `placeholder`, `maxLength` |
| `email` | Email input with validation | Auto-validates email format |
| `tel` | Phone number input | `placeholder` |
| `textarea` | Multi-line text | `rows`, `maxLength` |
| `select` | Dropdown select | `options`, `optionsSource` |
| `checkbox` | Single checkbox | - |
| `checkbox-group` | Multiple checkboxes | `optionsSource`, `allRequired` |
| `recaptcha` | reCAPTCHA widget | Auto-configured |
| `terms-display` | Read-only terms display | `source: "dataset.terms"` |
| `disclaimer-display` | Warning message | `source: "dataset.disclaimers"` |
| `address-group` | Address fields group | `subFields` |

### Available Validators

| Type | Value | Description |
|------|-------|-------------|
| `required` | - | Field must have a value |
| `requiredTrue` | - | Checkbox must be checked |
| `email` | - | Valid email format |
| `minLength` | number | Minimum character count |
| `maxLength` | number | Maximum character count |
| `pattern` | string | Regex or predefined pattern |
| `blacklist` | string[] | Array of blocked regex patterns |
| `latinOnly` | - | Only ASCII printable characters |

Predefined patterns: `latin-only`, `alpha`, `alphanumeric`, `numeric`, `phone`

## Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  formConfigUrl: 'assets/form-config.yaml',
  countriesUrl: 'assets/countries.json',
  configUrl: 'assets/config.json',
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  debug: true,              // Enable console logging
  simulateSubmission: false // Set true to bypass backend
};
```

| Setting | Description |
|---------|-------------|
| `formConfigUrl` | Path to YAML config file |
| `countriesUrl` | Path to countries JSON |
| `configUrl` | Path to app config (API URLs) |
| `recaptchaSiteKey` | Google reCAPTCHA v2 site key |
| `debug` | Enable debug logging |
| `simulateSubmission` | Bypass backend for UI testing |

## Dark Mode

Click the floating button (bottom-left) to toggle dark mode. Preference is saved to localStorage.

## Form Submission Flow

1. User visits `/?ediid=<dataset-id>`
2. `FormConfigService` loads and parses `form-config.yaml`
3. Dataset and form config are matched by ID
4. `DynamicFormBuilderService` creates Angular `FormGroup` with validators
5. `DynamicFormComponent` renders sections and fields
6. On submit, `AppComponent` builds payload and calls `RPAService.createRecord()`
7. Backend creates Salesforce case for approval

## Troubleshooting

### "Cannot find module 'oarng'"
Run from repository root:
```bash
git submodule update --init --recursive
npm install --legacy-peer-deps
cd lib && npx ng build oarng
```

### "Dataset Not Found" error
Ensure the `ediid` query parameter matches a dataset ID in `form-config.yaml`.

### Form not submitting
1. Check browser console for validation errors
2. Ensure reCAPTCHA is completed
3. Verify `simulateSubmission` is `false` for real backend testing

### Tests failing
```bash
# Run tests with verbose output
npx jest --verbose

# Run specific test file
npx jest src/app/dynamic-form/services/validator-factory.service.spec.ts
```
