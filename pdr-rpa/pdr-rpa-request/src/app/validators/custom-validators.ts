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
     * Validator that checks if the email is blacklisted based on patterns, email addresses, and domains.
     * @param blacklistedPatterns - The array of blacklisted patterns.
     * @param blacklistedEmails - The array of blacklisted email addresses.
     * @param blacklistedDomains - The array of blacklisted email domains.
     * @returns A validator function that returns an error if the email is blacklisted.
     */
    static blacklisted(
        blacklistedPatterns: string[],
        blacklistedEmails: string[],
        blacklistedDomains: string[]
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const email = control.value;

            if (email) {
                // Check against blacklisted patterns
                for (const pattern of blacklistedPatterns) {
                    if (email.includes(pattern)) {
                        // Return an error if the email contains a blacklisted pattern
                        return { blacklisted: true };
                    }
                }

                // Check against blacklisted emails
                if (blacklistedEmails.includes(email)) {
                    // Return an error if the email is blacklisted
                    return { blacklisted: true };
                }

                // Check against blacklisted domains
                const domain = email.substring(email.lastIndexOf('@') + 1);
                if (blacklistedDomains.includes(domain)) {
                    // Return an error if the email domain is blacklisted
                    return { blacklisted: true };
                }
            }

            return null; // Return null if the validation passes
        };
    }
}
