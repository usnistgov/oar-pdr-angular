import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for Angular reactive forms.
 */
export class CustomValidators {
    /**
     * Validator that checks if the input contains non-Latin characters.
     * @returns A validator function that returns an error if the input contains non-Latin characters.
     */
    static nonLatinCharacters(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // Regex pattern for printable ASCII characters and spaces
            const asciiRegex = /^[\x21-\x7E ]+$/;

            if (control.value && !asciiRegex.test(control.value)) {
                // Return an error if the input doesn't match the pattern
                return { nonLatin: true };
            }

            return null; // Return null if the validation passes
        };
    }

    /**
     * Validator that checks if the email is blacklisted based on patterns.
     * @param blacklistedPatterns - The array of blacklisted patterns.
     * @returns A validator function that returns an error if the email matches a blacklisted pattern.
     */
    static blacklisted(blacklistedPatterns: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const email = control.value;

            if (email) {
                // Check against blacklisted patterns
                for (const pattern of blacklistedPatterns) {
                    const regex = new RegExp(pattern);
                    if (regex.test(email)) {
                        // Return an error if the email matches a blacklisted pattern
                        return { blacklisted: 'pattern' };
                    }
                }
            }

            return null; // Return null if the validation passes
        };
    }
}
