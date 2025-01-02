import { ValidationResult } from "../types/validationTypes";

/**
 * Create validation result object.
 *
 * @param isValid Success status
 * @param message Optional error message
 * @returns Result object
 */
export function createValidationResult(
  isValid: boolean,
  message?: string,
): ValidationResult {
  return { isValid, message };
}
