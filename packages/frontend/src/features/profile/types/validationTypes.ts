/**
 * Result of validation operations.
 *
 * Fields:
 * - isValid: Validation success
 * - message: Optional error message
 */
export type ValidationResult = {
	isValid: boolean;
	message?: string;
};
