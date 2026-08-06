import type { JsonSchema } from '../types/index.ts';

/**
 * Adds a minimum string length constraint while preserving an existing one.
 *
 * @param jsonSchema The JSON Schema object.
 * @param requirement The minimum string length.
 */
export function addMinLength(
  jsonSchema: JsonSchema,
  requirement: number
): void {
  jsonSchema.minLength = Math.max(jsonSchema.minLength ?? 0, requirement);
}
