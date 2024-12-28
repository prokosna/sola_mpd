import { ValidationResult } from "../types/validationTypes";

/**
 * Creates a ValidationResult object.
 * @param isValid - A boolean indicating whether the validation passed.
 * @param message - An optional string providing additional information about the validation result.
 * @returns A ValidationResult object containing the validation status and optional message.
 */
export function createValidationResult(
  isValid: boolean,
  message?: string,
): ValidationResult {
  return { isValid, message };
}
