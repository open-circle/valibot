import type { JsonSchema } from '../types/index.ts';

/**
 * Adds a maximum string length constraint while preserving an existing one.
 *
 * @param jsonSchema The JSON Schema object.
 * @param requirement The maximum string length.
 */
export function addMaxLength(
  jsonSchema: JsonSchema,
  requirement: number
): void {
  jsonSchema.maxLength = Math.min(
    jsonSchema.maxLength ?? Number.POSITIVE_INFINITY,
    requirement
  );
}
